import { requestContext } from "@/services/requestContext"
import { WebSocket } from "ws"
import { ConversationState } from "../conversations/conversation_state"
import { saveToDebug } from "@/services/utils"
import type { IAssistantTurn } from "@/types"
import type { IAssistantReply } from "@shared/shared_types"

export class TalkToUserService {
  ws: WebSocket
  state: ConversationState
  assistantTurn: IAssistantTurn

  constructor (ws: WebSocket, state: ConversationState, assistantTurn: IAssistantTurn) {
    this.ws = ws
    this.state = state
    this.assistantTurn = assistantTurn
  }

  async startStreaming () {
    const payload: IAssistantReply = {
      type: 'reply_start',
      text: this.assistantTurn.repliedText
    }

    this.ws.send(JSON.stringify(payload))
  }

  async streamSpeech (chunk: Buffer) {
    this.ws.send(chunk)
  }

  async endStreaming () {
    const payload: IAssistantReply = {
      type: 'reply_end',
    }

    this.ws.send(JSON.stringify(payload))
  }
}