import { requestContext } from "@/services/requestContext"
import { WebSocket } from "ws"
import { getAudioStream } from "@/modules/conversations/storage"
import { ConversationState } from "../conversations/conversation_state"
import { saveToDebug } from "@/services/utils"
import type { IAssistantTurn } from "@/types"

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
    this.ws.send(JSON.stringify({
      type: 'reply_start',
      streamId: this.assistantTurn.speechStreamId,
      text: this.assistantTurn.repliedText
    }))
  }

  async streamSpeech (chunk: Buffer) {
    this.ws.send(chunk)
  }

  async endStreaming () {
    this.ws.send(JSON.stringify({
      type: 'reply_end',
      streamId: this.assistantTurn.speechStreamId,
    }))
  }
}