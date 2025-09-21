import { generateText } from "./llm_claude"
import { ConversationState } from "@/modules/conversations/conversation_state"
import { IAssistantTurn } from "@/core/types/core"
import { ILLMService } from "../conversations/conversationManager"

export class LLMService implements ILLMService {
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