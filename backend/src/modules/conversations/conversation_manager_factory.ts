import { ConversationState } from "./conversation_state"
import { ConversationManager } from "./conversationManager"
import { TextToSpeechService } from "@/modules/t2s/text_to_speech_service"
import { LLMService } from "@/modules/text_completions/llmService"

function newConversationManager(conversationState: ConversationState) {
  const convoManager = new ConversationManager(
    conversationState,
    {
      llm: new LLMService(),
      textToSpeech: new TextToSpeechService(),
    }
  )

  return convoManager
}

export { newConversationManager }