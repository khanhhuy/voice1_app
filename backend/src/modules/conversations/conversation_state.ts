import { IAssistantTurn, IConversation, IUserTurn, ITranscriptionEvent, ConversationStatus } from "@/core/types/core"
import { logger } from "@/logger"
import { some } from "lodash"

const ASSISTANT_ID = 'jane'

class ConversationState {
  private conversation: IConversation

  constructor(sessionId: string, userId: string) {
    this.conversation = {
      status: 'created',
      sessionId,
      userId,
      userTurns: [],
      assistantTurns: [],
      startTime: Date.now(),
    }
  }

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
      startTime: Date.now(),
      finishedAt: 0
    }
    this.conversation.userTurns.push(turn)
    return turn
  }

  addChunkToUserTurn(turnId: string, transcriptionEvent: ITranscriptionEvent): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) throw new Error('Turn not found')
    
    turn.chunks.push(transcriptionEvent)
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

  updateUserTurnFinishedAt(turnId: string, ts: number): void {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return
    
    turn.finishedAt = ts
  }

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
    logger.info('Cancelling assistant turn', { turnId })
    this.updateAssistantTurnStatus(turnId, 'cancelled')
  }

  checkAllTranscribed(turnId: string) {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return

    turn.allTranscribed = turn.chunks.every(c => c.status === 'transcribed' || c.status === 'ignored')
    if (turn.allTranscribed) {
      turn.cachedText = turn.chunks.map(c => c.transcription).join(', ')
    }

    return turn.allTranscribed
  }

  getLastTranscripted(turnId: string): ITranscriptionEvent | null {
    const turn = this.conversation.userTurns.find(t => t.id === turnId)
    if (!turn) return null

    let i = turn.chunks.length - 1
    while (i >= 0) {
      if (turn.chunks[i].status === 'transcribed') {
        return turn.chunks[i]
      }
      i--
    }

    return null
  }

  setAssistantText(turnId: string, text: string): void {
    const turn = this.conversation.assistantTurns.find(t => t.id === turnId)
    if (turn) {
      turn.repliedText = text
      turn.status = 'generated-text'
    }
  }

  getConversation(): IConversation {
    return this.conversation
  }

  getLastUserTurn(): IUserTurn | null {
    return this.getCurrentUserTurn()
  }

  getLastAssistantTurn(): IAssistantTurn | null {
    return this.getCurrentAssistantTurn()
  }

  getUserId(): string {
    return this.conversation.userId
  }

  emptyUserTurn(): boolean {
    const lastUserTurn = this.getLastUserTurn()

    if (!lastUserTurn) return false

    return lastUserTurn.chunks.every((c) => {
      return c.status === 'ignored'
    })
  }

  updateConvoStatus(status: ConversationStatus): void {
    this.conversation.status = status
  }
}

export { ConversationState }