import { ConversationState } from "./conversation_state"
// import { generateText } from "@/modules/text_completions/llm_groq"
// import { generateText } from "@/modules/text_completions/llm_openai"
import { generateText } from "@/modules/text_completions/llm_claude"
import { ConversationManager } from "./conversationManager"
import type { ILLMService } from "./conversationManager"
import { TextToSpeechService } from "@/modules/t2s/text_to_speech_service"
import { IAssistantTurn } from "@/core/types/core"

class LLMService implements ILLMService {
  async generateResponse(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string) {
    console.log('--------------')
    const response = await generateText(state.getConversation(), assistantTurn.id)

    console.log(new Date().toISOString())
    console.log(`Assistant 🤖: ${assistantTurn.id} \n`, response.text)

    if (assistantTurn.status === 'cancelled') {
      return
    }

    state.setAssistantText(assistantTurn.id, response.text)
  }
}

function newConversationManager(userId: string, sessionId: string, conversationState: ConversationState) {
  const convoManager = new ConversationManager(
    sessionId,
    userId,
    conversationState,
    {
      llm: new LLMService(),
      textToSpeech: new TextToSpeechService(),
    }
  )

  return convoManager
}

export { newConversationManager }