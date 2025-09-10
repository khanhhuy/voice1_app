import { TalkToUserService } from "./talk_to_user_stream_service"
import type { ITextToSpeechService } from "@/modules/conversations/conversationManager"
import { requestContext } from "@/services/requestContext"
import type { ConversationState } from "@/modules/conversations/conversation_state"
import { streamSpeech } from "./voice_inworld_stream"
import { IAssistantTurn } from "@/types"

class TextToSpeechService implements ITextToSpeechService {
  private startStreaming = false

  async generateSpeech(state: ConversationState, turn: IAssistantTurn, processingId: string) {
    this.startStreaming = false

    if (!turn || !turn.repliedText) {
      state.updateAssistantTurnStatus(turn.id, 'streamed-speech')
      return
    }

    const ws = requestContext.get('ws')
    if (!ws) {
      throw new Error('WebSocket not found')
    }

    const streamService = new TalkToUserService(ws, state, turn)

    streamSpeech(turn.repliedText,
      (chunk) => {
        if (turn.status === 'cancelled') {
          // stop streaming
          return
        }

        this.onChunkCb(chunk, streamService, state, turn)
      },
      async () => {
        await streamService.endStreaming()
        if (turn.status !== 'cancelled') {
          state.updateAssistantTurnStatus(turn.id, 'streamed-speech')
        }
      }
    )
  }

  private async onChunkCb (chunk: Buffer, streamService: TalkToUserService, state: ConversationState, turn: IAssistantTurn) {
    if (!this.startStreaming) {
      console.log('Start streaming at ')
      console.log(new Date().toISOString())
      this.startStreaming = true
      await streamService.startStreaming()
      state.updateAssistantTurnStatus(turn.id, 'streaming-speech')
    }

    streamService.streamSpeech(chunk)
  }
}

export { 
  TextToSpeechService
}