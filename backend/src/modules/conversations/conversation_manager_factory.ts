import { ConversationState } from "./conversation_state"
import { ConversationManager } from "./conversationManager"
import { TextToSpeechService } from "@/modules/t2s/text_to_speech_service"
import { LLMService } from "@/modules/text_completions/llmService"
import { IUsage } from "@/core/types/core"

function newConversationManager(
  conversationState: ConversationState,
  usage: IUsage.Usage,
  quota: IUsage.Quota
) {
  const convoManager = new ConversationManager(
    conversationState,
    {
      llm: new LLMService(),
      textToSpeech: new TextToSpeechService(),
    },
    {
      usage,
      quota
    }
  )

  return convoManager
}

export { newConversationManager }