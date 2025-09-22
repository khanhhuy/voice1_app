import { generateText } from "./llm_claude"
import { ConversationState } from "@/modules/conversations/conversationState"
import { IAssistantTurn } from "@/core/types/core"
import { ILLMService } from "../conversations/conversationManager"
import { logger } from "@/logger"
import { UsageControl } from "../usage/usageControl"

export class LLMService implements ILLMService {
  async generateResponse(
    state: ConversationState,
    assistantTurn: IAssistantTurn,
    processingId: string,
    options: { usageControl?: UsageControl }
  ) {
    const response = await generateText(state.getConversation(), assistantTurn.id, options)

    logger.debug(new Date().toISOString())
    logger.debug(`Assistant 🤖: ${assistantTurn.id} \n`, response.text)

    if (assistantTurn.status === 'cancelled') {
      return
    }

    state.setAssistantText(assistantTurn.id, response.text)
  }
}