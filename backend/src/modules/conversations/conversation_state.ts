import { IAudioChunk, IAssistantTurn, IConversation, IStopSignal, ITranscription, IUserTurn, ISpeechChunk } from "@/types"

const ASSISTANT_ID = 'jane'

class ConversationState {
  private conversation: IConversation

  constructor(sessionId: string, userId: string) {
    this.conversation = {
      sessionId,
      userId,
      userTurns: [],
      assistantTurns: [],
      startTime: Date.now(),
      lastSequenceNumber: 0
    }
  }

  // User turn management
  getCurrentUserTurn(): IUserTurn | null {
    return this.conversation.userTurns[this.conversation.userTurns.length - 1] || null
  }

  createUserTurn(): IUserTurn {
    const turn: IUserTurn = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'userTurn',
      participantId: this.conversation.userId,
      chunks: [],
      status: 'new',
      allTranscribed: false,
      startTime: Date.now()
    }
    this.conversation.userTurns.push(turn)
    return turn
  }

  addChunkToUserTurn(turnId: string, transcriptions: ITranscription[]): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) throw new Error('Turn not found')
    
    const chunk: ISpeechChunk = {
      transcriptions,
      text: '',
      status: 'unprocessed',
      retryCount: 0
    }
    turn.chunks.push(chunk)
    turn.allTranscribed = false
  }

  updateUserTurnStatus(turnId: string, status: IUserTurn['status']): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return
    
    turn.status = status
    if (status === 'completed') {
      turn.endTime = Date.now()
    }
  }

  // Assistant turn management
  getCurrentAssistantTurn(): IAssistantTurn | null {
    return this.conversation.assistantTurns[this.conversation.assistantTurns.length - 1] || null
  }

  createAssistantTurn(responseToTurnId: string): IAssistantTurn {
    const turn: IAssistantTurn = {
      id: `assistant-${Date.now()}-${Math.random()}`,
      type: 'assistantTurn',
      participantId: ASSISTANT_ID,
      responseToTurnId,
      status: 'wait-speaking',
      startTime: Date.now(),
      retryCount: 0
    }
    this.conversation.assistantTurns.push(turn)
    return turn
  }

  updateAssistantTurnStatus(turnId: string, status: IAssistantTurn['status']): void {
    const turn = this.conversation.assistantTurns.find(t => t.id === turnId)
    if (!turn) return
    
    turn.status = status
    if (status === 'completed' || status === 'cancelled') {
      turn.endTime = Date.now()
    }
  }

  cancelAssistantTurn(turnId: string): void {
    console.log('cancelling assistant turn', turnId)
    this.updateAssistantTurnStatus(turnId, 'cancelled')
  }

  // Chunk management
  updateChunkStatus(turnId: string, sequence: number, status: IAudioChunk['status'], processingId?: string): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return
    
    const chunk = turn.chunks.find(c => c.sequence === sequence)
    if (!chunk) return
    
    chunk.status = status
    if (processingId !== undefined) {
      chunk.processingId = processingId
    }
    
    if (status === 'failed') {
      chunk.retryCount++
    }
    
    // Check if all chunks are transcribed
    if (turn.status !== 'speaking') {
      this.checkAllTranscribed(turnId)
    }
  }

  updateChunkTranscription(turnId: string, sequence: number, transcriptions: ITranscription[], text: string): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return
    
    const chunk = turn.chunks.find(c => c.sequence === sequence)
    if (!chunk) return
    
    chunk.transcriptions = transcriptions
    chunk.text = text
    chunk.status = 'transcribed'
    
    // Update cached text for the turn
    turn.cachedText = turn.chunks
      .filter(c => c.text)
      .sort((a, b) => a.sequence - b.sequence)
      .map(c => c.text)
      .join(' ')
    
    this.checkAllTranscribed(turnId)
  }

  checkAllTranscribed(turnId: string) {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return

    turn.chunks.forEach(c => {
      if (c.status === 'transcribed') {
        c.lastSeen = Date.now()
      }
    })

    turn.allTranscribed = turn.chunks.every(c => c.status === 'transcribed' || (c.status === 'failed' && c.retryCount >= 2))
  }

  // Helper methods
  updateLastSequenceNumber(sequence: number): void {
    this.conversation.lastSequenceNumber = Math.max(this.conversation.lastSequenceNumber, sequence)
  }

  getUnprocessedChunks(turnId: string): IAudioChunk[] {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return []
    
    return turn.chunks.filter(c => 
      c.status === 'unprocessed' || 
      (c.status === 'failed' && c.retryCount < 2)
    )
  }

  setAssistantText(turnId: string, text: string): void {
    const turn = this.conversation.assistantTurns.find(t => t.id === turnId)
    if (turn) {
      turn.repliedText = text
      turn.status = 'generated-text'
    }
  }

  incrementAssistantRetryCount(turnId: string): void {
    const turn = this.conversation.assistantTurns.find(t => t.id === turnId)
    if (turn) {
      turn.retryCount++
    }
  }

  // Getters for the conversation manager
  getConversation(): IConversation {
    return this.conversation
  }

  getLastUserTurn(): IUserTurn | null {
    return this.getCurrentUserTurn()
  }

  getLastAssistantTurn(): IAssistantTurn | null {
    return this.getCurrentAssistantTurn()
  }

  emptyUserTurn(): boolean {
    const lastUserTurn = this.getLastUserTurn()

    if (!lastUserTurn) return false

    return lastUserTurn.chunks.every((c) => {
      return c.status === 'transcribed' && c.transcriptions?.length === 0
    })
  }
}

export { ConversationState }