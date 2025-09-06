import { ConversationState } from "./conversation_state"
import { whisperGroq } from "@/modules/s2t/whisperGroq"
import { generateText } from "@/modules/text_completions/llm_groq"
import { ConversationManager } from "./conversation_manager"
import type { ILLMService } from "./conversation_manager"
import { TextToSpeechService } from "@/modules/t2s/text_to_speech_service"
import { IAssistantTurn } from "@/types"


class LLMService implements ILLMService {
  async generateResponse(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string) {
    console.log('--------------')
    console.log(new Date().toISOString())
    console.log(`Human 💂‍♂️: ${state.getLastUserTurn()?.id} \n`, state.getLastUserTurn()?.cachedText)
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