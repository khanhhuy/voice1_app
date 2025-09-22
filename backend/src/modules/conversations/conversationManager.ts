import type { IAssistantTurn, ITranscriptionEvent, IUserTurn, SpeechEvent, IUsage } from "@/core/types/core"
import { ConversationState } from "./conversationState"
import { AudioProcessor } from "./audioProcessor"
import { some } from "lodash"
import type { ClientServerEvent } from '@shared/shared_types'
import Session from "@/models/Session"
import { UsageControl } from "@/modules/usage/usageControl"
import { persistConversation } from "./persist"

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

// TODO: force close the conversation if it exceeds a time limit

// Conversation Manager
class ConversationManager {
  private speechEventBuffer: SpeechEvent[]
  public conversationState: ConversationState
  private loopInterval: number = 200 // milliseconds
  private intervalId: NodeJS.Timeout | null = null

  // Service instances (injected or created)
  private llm: ILLMService
  private textToSpeech: ITextToSpeechService
  private audioProcessor: AudioProcessor
  private usageControl: UsageControl

  constructor(
    conversationState: ConversationState,
    services: {
      llm: ILLMService,
      textToSpeech: ITextToSpeechService,
    },
    usage: {
      usage: IUsage.Usage,
      quota: IUsage.Quota,
    }
  ) {
    this.speechEventBuffer = []
    this.conversationState = conversationState
    this.llm = services.llm
    this.textToSpeech = services.textToSpeech

    this.usageControl = new UsageControl(usage.usage, usage.quota)

    this.audioProcessor = new AudioProcessor(
      conversationState.getConversation().sessionId,
      this.onReceiveTranscription.bind(this),
      this.usageControl
    )
  }

  async prepare(): Promise<void> {
    await this.audioProcessor.init()
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      return
    }

    this.intervalId = setInterval(() => this.loop(), this.loopInterval)
    this.conversationState.updateConvoStatus('in_progress')
    persistConversation(this.conversationState, this.usageControl)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.audioProcessor.close()

    this.conversationState.updateConvoStatus('completed')
    persistConversation(this.conversationState, this.usageControl)
  }

  get isStarted(): boolean {
    return this.intervalId !== null
  }

  private loop(): void {
    // this.reportLastTurns()

    // 1. Process user turn
    this.processSpeechEvents()

    // 2. Process assistant turn
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

  private processSpeechEvents(): void {
    const transcriptionEvents = SpeechEventHelper.extractTranscriptionEvents(this.speechEventBuffer)

    let currentUserTurn = this.conversationState.getCurrentUserTurn()

    // Check if we need to create a new turn
    if (!currentUserTurn || currentUserTurn.status === 'completed') {
      currentUserTurn = this.conversationState.createUserTurn()
    }

    // Add chunks to current turn
    transcriptionEvents.forEach((event) => {
      this.conversationState.addChunkToUserTurn(currentUserTurn.id, event)
    })

    const allTranscribed = this.conversationState.checkAllTranscribed(currentUserTurn.id)

    if (currentUserTurn.status === 'new') {
      if (currentUserTurn.chunks.length > 0) {
        this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'speaking')
      }
    } else if (currentUserTurn.status === 'speaking') {
      // if the last event is start-speech, we wail until the speech is fully present
      // the speech is in either 2 states: [start], [end, speech events, start]
      // speech events will never be available without the end event
      const lastEvent = this.speechEventBuffer[this.speechEventBuffer.length - 1]
      if (lastEvent && lastEvent.type === 'start-speech') {
        this.speechEventBuffer = [lastEvent]
        return
      }

      // total waiting time = transcription time + 1s from the last event
      // - transcription time can be quite fast ~ 0.5s
      // - 1s is ok-ish, 0.5s is to fast
      if (this.isEndSpeechTurn(currentUserTurn)) {
        this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'wait-replying')
        this.conversationState.updateUserTurnFinishedAt(currentUserTurn.id, Date.now())
      }
    } else if (currentUserTurn.status === 'wait-replying') {
      if (this.hasNewSpeech(currentUserTurn)) {
        this.conversationState.updateUserTurnStatus(currentUserTurn.id, 'speaking')
        return
      }
    }

    // Clear the buffer after processing
    this.speechEventBuffer = []
  }

  private isEndSpeechTurn(turn: IUserTurn): boolean {
    if (turn.status !== 'speaking') {
      throw new Error('Turn is not speaking')
    }

    if (!turn.allTranscribed) {
      return false
    }

    const lastEvent = turn.chunks[turn.chunks.length - 1]

    if (lastEvent && this.exceedWaitingTime(lastEvent)) {
      return true
    }

    return false
  }

  private exceedWaitingTime(lastTranscripted: ITranscriptionEvent): boolean {
    const waitingTimeMs = 1000
    return lastTranscripted.updatedAt < Date.now() - waitingTimeMs
  }

  private hasNewSpeech(turn: IUserTurn): boolean {
    return some(turn.chunks, (c) => {
      return c.status === 'transcribed' && c.updatedAt > turn.finishedAt
    })
  }

  private processAssistantTurn(): void {
    const lastUserTurn = this.conversationState.getLastUserTurn()
    const lastAssistantTurn = this.conversationState.getLastAssistantTurn()

    if (!lastUserTurn) return

    // Check if current assistant turn needs to be cancelled
    if (lastAssistantTurn && lastAssistantTurn.status !== 'completed' && lastAssistantTurn.status !== 'cancelled') {
      // User is speaking after exceed waiting time, so we cancel the assistant turn to wait for more input
      if (lastUserTurn.status === 'speaking') {
        this.conversationState.cancelAssistantTurn(lastAssistantTurn.id)
        return
      }

      // Cancel if responding to wrong turn
      if (lastAssistantTurn && lastAssistantTurn.responseToTurnId !== lastUserTurn.id) {
        this.conversationState.cancelAssistantTurn(lastAssistantTurn.id)
      }
    }


    // Check if we need to create a new assistant turn
    if (lastUserTurn.status === 'wait-replying') {
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
      else {
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

        persistConversation(this.conversationState, this.usageControl)

        break
    }
  }

  private initLLMGeneration(assistantTurn: IAssistantTurn): void {
    const processingId = `llm-${assistantTurn.id}-${Date.now()}`
    this.llm.generateResponse(this.conversationState, assistantTurn, processingId, { usageControl: this.usageControl })
  }

  private initSpeechGeneration(assistantTurn: IAssistantTurn): void {
    const processingId = `tts-${assistantTurn.id}-${Date.now()}`
    this.textToSpeech.generateSpeech(this.conversationState, assistantTurn, processingId, { usageControl: this.usageControl })
  }

  private cancelInvalidUserTurn(lastAssistantTurn: IAssistantTurn | null, lastUserTurn: IUserTurn): void {
    if (lastAssistantTurn && lastAssistantTurn.responseToTurnId === lastUserTurn.id) {
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

  receiveEndConvoSignal(): void {
    this.stop()
  }
}

// Service interfaces
interface ILLMService {
  generateResponse(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string, options: { usageControl?: UsageControl }): void
}

interface ITextToSpeechService {
  generateSpeech(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string, options: { usageControl?: UsageControl }): void
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
