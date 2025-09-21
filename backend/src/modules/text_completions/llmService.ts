import { generateText } from "./llm_claude"
import { ConversationState } from "@/modules/conversations/conversation_state"
import { IAssistantTurn } from "@/core/types/core"
import { ILLMService } from "../conversations/conversationManager"
import { logger } from "@/logger"

export class LLMService implements ILLMService {
  async generateResponse(state: ConversationState, assistantTurn: IAssistantTurn, processingId: string) {
    const response = await generateText(state.getConversation(), assistantTurn.id)

    logger.debug(new Date().toISOString())
    logger.debug(`Assistant 🤖: ${assistantTurn.id} \n`, response.text)

    if (assistantTurn.status === 'cancelled') {
      return
    }

    state.setAssistantText(assistantTurn.id, response.text)
  }
}