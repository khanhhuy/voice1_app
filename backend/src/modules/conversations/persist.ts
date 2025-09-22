import { UsageControl } from "../usage/usageControl";
import { logger } from "@/logger";
import { omit } from "lodash";
import { ConversationState } from "./conversationState";
import Session from "@/models/Session";

// TODO: handle race condition when the database has not been updated yet
// but there is a new request to update the conversation
async function persistConversation(state: ConversationState, usage: UsageControl) {
  const data = {
    conversation: omit(state.getConversation(), 'sessionId', 'userId'),
    usage: usage.getUsage(),
  }

  try {
    await Session.update(
      {
        data,
      }, {
        where: { id: state.getConversation().sessionId },
      }
    )
  } catch (error) {
    logger.error(`Error persisting conversation for session: ${state.getConversation().sessionId}`, { error })
  }
}

export { persistConversation }