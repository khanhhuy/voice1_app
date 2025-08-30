import type { AudioBufferItem, IAssistantTurn, IEndConvoSignal, IStartSpeakingSignal, IStopSignal, ITranscription, ITranscriptionEvent, IUserTurn, SpeechEvent } from "@/types"
import { ConversationState } from "./conversation_state"
import { AudioProcessor } from "./audioProcessor"
import { ConvoLogger } from "@/services/convoLogger"

// TODO: cancel the loop if the state stays consistent for X seconds
//       cancel when websocket is closed
class AudioBuffer {
  private items: AudioBufferItem[] = []
  
  push(item: AudioBufferItem): void {
    this.items.push(item)
  }
  
  hasItems(): boolean {
    return this.items.length > 0
  }
  
  getLastItem(): AudioBufferItem | null {
    return this.items[this.items.length - 1] || null
  }
  
  isLastItemStopSignal(): boolean {
    const lastItem = this.getLastItem()
    return lastItem !== null && 'type' in lastItem && lastItem.type === 'stop'
  }

  containStartSpeakingSignal(): boolean {
    return this.items.some(item => 'type' in item && item.type === 'start-speaking')
  }

  extractAudioChunks(): { chunks: Buffer[], sequences: number[] } {
    const chunks: Buffer[] = []
    const sequences: number[] = []
    
    // Extract all audio chunks (not stop signals)
    this.items = this.items.filter(item => {
      if ('type' in item) {
        return false // Remove stop signals after processing
      }
      chunks.push(item as Buffer)
      // Assuming we track sequence numbers separately
      sequences.push(Date.now()) // TODO: You'd get actual sequence from somewhere
      return false // Remove from buffer
    })
    
    return { chunks, sequences }
  }
  
  clear(): void {
    this.items = []
  }
}


class SpeechEventHelper {
  static isDoneSpeaking(events: SpeechEvent[]): boolean {
    return events[events.length - 1].type === 'end-speech'
  }

  static extractTranscriptionEvents(events: SpeechEvent[]): ITranscriptionEvent[] {
    return events.filter(event => event.type === 'transcription') as ITranscriptionEvent[]
  }

  static containStartSpeechSignal(events: SpeechEvent[]): boolean {
    return events.some(event => event.type === 'start-speech')
  }
}

// Conversation Manager
class ConversationManager {
  private audioBuffer: AudioBuffer
  private speechEventBuffer: SpeechEvent[]
  private conversationState: ConversationState
  private loopInterval: number = 200 // milliseconds
  private intervalId: NodeJS.Timeout | null = null
  
  // Service instances (injected or created)
  private llm: ILLMService
  private textToSpeech: ITextToSpeechService
  private audioProcessor: AudioProcessor
  public logger: ConvoLogger
  
  constructor(
    sessionId: string,
    participantId: string,
    conversationState: ConversationState,
    services: {
      llm: ILLMService,
      textToSpeech: ITextToSpeechService,
    }
  ) {
    this.audioBuffer = new AudioBuffer()
    this.conversationState = conversationState
    this.llm = services.llm
    this.textToSpeech = services.textToSpeech
    this.logger = new ConvoLogger()
    this.audioProcessor = new AudioProcessor(sessionId, this.onReceiveTranscription.bind(this), this.logger)
  }
  
  async start(): Promise<void> {
    if (this.isStarted) {
      return
    }

    // this.intervalId = setInterval(() => this.loop(), this.loopInterval)
    await this.audioProcessor.init()
    this.logger.start()
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  get isStarted(): boolean {
    return this.intervalId !== null
  }
  
  private loop(): void {
    // this.reportLastTurns()

    // 1. Process audio buffer
    this.processAudioBuffer()
    
    // 2. Process user turn transcriptions
    this.processUserTurnTranscriptions()
    
    // 3. Process assistant turn
    this.processAssistantTurn()
  }

  private reportLastTurns(): void {
    const lastUserTurn = this.conversationState.getLastUserTurn()
    const lastAssistantTurn = this.conversationState.getLastAssistantTurn()
    console.log('--------------')

    if (lastUserTurn) {
      console.log(`Last user turn: ${lastUserTurn.status}, ${lastUserTurn.allTranscribed}`)
      console.log(lastUserTurn.cachedText)
    }

    if (lastAssistantTurn) {
      console.log(`Last assistant turn: ${lastAssistantTurn.status}`)
    }
  }

  private processAudioBuffer(): void {
    // if (!this.audioBuffer.hasItems()) {
    //   return
    // }

    // const isUserDoneSpeaking = this.audioBuffer.isLastItemStopSignal()
    // const { chunks, sequences } = this.audioBuffer.extractAudioChunks()
    
    // let currentUserTurn = this.conversationState.getCurrentUserTurn()
    // let containStartSpeakingSignal = this.audioBuffer.containStartSpeakingSignal()
    
    // // Check if we need to create a new turn
    // if (!currentUserTurn || currentUserTurn.status === 'completed') {
    //   console.log('create new user turn')
    //   currentUserTurn = this.conversationState.createUserTurn()
    // }
    
    // // Add chunks to current turn
    // chunks.forEach((chunk, index) => {
    //   const sequence = sequences[index]
    //   this.conversationState.addChunkToUserTurn(currentUserTurn.id, chunk, sequence)
    //   this.conversationState.updateLastSequenceNumber(sequence)
      
    //   // Immediately start transcription for this chunk
    //   this.initTranscription(currentUserTurn.id, sequence, chunk)
    // })
    
    // // Update turn status if user stopped speaking
    // if (isUserDoneSpeaking && ['new', 'speaking'].includes(currentUserTurn.status)) {
    //   console.log('update user turn to wait-replying', currentUserTurn.id)
    //   this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'wait-replying')
    // }

    // if (!isUserDoneSpeaking && containStartSpeakingSignal) {
    //   // we don't know if this is a real speaking or just noise
    //   // but in most cases, it would be user speaking, so we should stop the responding
    //   this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'speaking')
    // }

    // // Clear the buffer after processing
    // this.audioBuffer.clear()
  }

  private processTranscriptionRequest(): void {
    if (this.speechEventBuffer.length === 0) {
      return
    }

    const isDoneSpeaking = SpeechEventHelper.isDoneSpeaking(this.speechEventBuffer)
    const transcriptionEvents = SpeechEventHelper.extractTranscriptionEvents(this.speechEventBuffer)

    let currentUserTurn = this.conversationState.getCurrentUserTurn()

    if (!currentUserTurn || currentUserTurn.status === 'completed') {
      currentUserTurn = this.conversationState.createUserTurn()
    }

    transcriptionEvents.forEach(event => {
      this.conversationState.addChunkToUserTurn(currentUserTurn.id, event.transcriptions)
    })

    // Update turn status if user stopped speaking
    if (isDoneSpeaking && ['new', 'speaking'].includes(currentUserTurn.status)) {
      this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'wait-replying')
    }

    if (!isDoneSpeaking && SpeechEventHelper.containStartSpeechSignal(this.speechEventBuffer)) {
      this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'speaking')
    }

    this.speechEventBuffer = []
  }

  private processUserTurnTranscriptions(): void {
    const lastUserTurn = this.conversationState.getLastUserTurn()
    if (!lastUserTurn) return
    
    // Get chunks that need transcription
    const unprocessedChunks = this.conversationState.getUnprocessedChunks(lastUserTurn.id)
    
    // Start transcription for unprocessed chunks
    unprocessedChunks.forEach(chunk => {
      if (chunk.status === 'unprocessed' || (chunk.status === 'failed' && chunk.retryCount < 2)) {
        this.initTranscription(lastUserTurn.id, chunk.sequence, chunk.audioBuffer)
      }
    })

    if (['new', 'wait-replying'].includes(lastUserTurn.status)) {
      // if there is one unseen chunk is valid (real speak), update the turn to speaking
      lastUserTurn.chunks.forEach(c => {
        const textt = (c.text || '').trim()
        if (c.status === 'transcribed' &&  textt !== '' && !c.lastSeen) {
          console.log('update user turn to speaking', lastUserTurn.id)
          this.conversationState.updateUserTurnStatus(lastUserTurn.id, 'speaking')
        }
      })
    }

    this.conversationState.checkAllTranscribed(lastUserTurn.id)
  }
  
  private processAssistantTurn(): void {
    const lastUserTurn = this.conversationState.getLastUserTurn()
    const lastAssistantTurn = this.conversationState.getLastAssistantTurn()
    
    if (!lastUserTurn) return

    // Check if current assistant turn needs to be cancelled
    if (lastAssistantTurn && lastAssistantTurn.status !== 'completed' && lastAssistantTurn.status !== 'cancelled') {
    //   // Cancel if user is speaking
      if (lastUserTurn.status === 'speaking') {
        console.log('cancel 3')
        this.conversationState.cancelAssistantTurn(lastAssistantTurn.id)
        return
      }
      
      // Cancel if responding to wrong turn
      if (lastAssistantTurn.responseToTurnId !== lastUserTurn.id) {
        console.log('cancel 2')
        this.conversationState.cancelAssistantTurn(lastAssistantTurn.id)
      }
    }
    
    // Check if we need to create a new assistant turn
    if (lastUserTurn.status === 'wait-replying' && lastUserTurn.allTranscribed) {
      if (this.conversationState.emptyUserTurn()) {
        this.cancelInvalidUserTurn(lastAssistantTurn, lastUserTurn)
        return
      }

      // No assistant turn or last one is completed/cancelled
      if (!lastAssistantTurn || lastAssistantTurn.status === 'completed' || lastAssistantTurn.status === 'cancelled') {
        const newAssistantTurn = this.conversationState.createAssistantTurn(lastUserTurn.id)
        this.conversationState.updateAssistantTurnStatus(newAssistantTurn.id, 'generating-text')
        this.initLLMGeneration(newAssistantTurn)
      }
      // Process existing assistant turn
      else if (lastAssistantTurn.responseToTurnId === lastUserTurn.id) {
        this.processExistingAssistantTurn(lastAssistantTurn)
      }
    }
  }
  
  private processExistingAssistantTurn(assistantTurn: IAssistantTurn): void {
    switch (assistantTurn.status) {
      case 'wait-speaking':
        // Should transition to generating-text
        this.conversationState.updateAssistantTurnStatus(assistantTurn.id, 'generating-text')
        this.initLLMGeneration(assistantTurn)
        break
        
      case 'generated-text':
        // Start speech generation
        this.conversationState.updateAssistantTurnStatus(assistantTurn.id, 'generating-speech')
        this.initSpeechGeneration(assistantTurn)
        break
        
      case 'streamed-speech':
        this.conversationState.updateAssistantTurnStatus(assistantTurn.id, 'completed')
          
        const userTurn = this.conversationState.getLastUserTurn()
        if (userTurn && userTurn.id === assistantTurn.responseToTurnId) {
          this.conversationState.updateUserTurnStatus(userTurn.id, 'completed')
        }
        break
    }
  }
  
  // Async service initiators
  private initTranscription(turnId: string, sequence: number, audioBuffer: Buffer): void {
    const processingId = `transcribe-${turnId}-${sequence}-${Date.now()}`
    this.conversationState.updateChunkStatus(turnId, sequence, 'transcribing', processingId)
    // this.transcriber.transcribe(this.conversationState, turnId, sequence, audioBuffer, processingId)
  }
  
  private initLLMGeneration(assistantTurn: IAssistantTurn): void {
    const processingId = `llm-${assistantTurn.id}-${Date.now()}`
    this.llm.generateResponse(this.conversationState, assistantTurn, processingId)
  }
  
  private initSpeechGeneration(assistantTurn: IAssistantTurn): void {
    const processingId = `tts-${assistantTurn.id}-${Date.now()}`
    this.textToSpeech.generateSpeech(this.conversationState, assistantTurn, processingId)
  }

  private cancelInvalidUserTurn(lastAssistantTurn: IAssistantTurn | null, lastUserTurn: IUserTurn): void {
    if (lastAssistantTurn && lastAssistantTurn.responseToTurnId === lastUserTurn.id) {
      console.log('cancel 1')
      this.conversationState.cancelAssistantTurn(lastAssistantTurn.id)
    }
    this.conversationState.updateUserTurnStatus(lastUserTurn.id, 'completed')
    return
  }

  onReceiveTranscription(event: SpeechEvent): void {
    this.speechEventBuffer.push(event)
  }
  
  // Method to receive audio from client
  receiveAudio(audioChunk: Buffer, sequence: number): void {
    this.audioProcessor.receiveRawAudioChunk(audioChunk)
  }
  
  // Method to receive stop signal from client
  receiveStopSignal(stopSignal: IStopSignal): void {
    this.audioBuffer.push(stopSignal)
  }

  receiveStartSpeakingSignal(startSpeakingSignal: IStartSpeakingSignal): void {
    this.audioBuffer.push(startSpeakingSignal)
  }

  receiveEndConvoSignal(endConvoSignal: IEndConvoSignal): void {
    this.stop()
  }
}

// Service interfaces
interface ILLMService {
  generateResponse(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string): void
}

interface ITextToSpeechService {
  generateSpeech(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string): void
}

interface ITalkToUserService {
  streamSpeech(state: ConversationState, assistantTurn: IAssistantTurn): void
}

export {
  ConversationManager,
  ILLMService,
  ITextToSpeechService,
  ITalkToUserService,
}
