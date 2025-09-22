import { ConversationState } from "./conversationState"
import { ConversationManager } from "./conversationManager"

const STORE_CONVERSATION_MANAGER: {
  [userId: string]: ConversationManager | undefined
} = {}

function defaultConversation(userId: string, sessionId: string) {
  const conversationState = new ConversationState(sessionId, userId)

  return conversationState
}

function setConversationManager(userId: string, conversationManager: ConversationManager) {
  STORE_CONVERSATION_MANAGER[userId] = conversationManager
}

function getConversationManager(userId: string) {
  return STORE_CONVERSATION_MANAGER[userId]
}

function clearConversationManager(userId: string | null) {
  if (userId) {
    delete STORE_CONVERSATION_MANAGER[userId]
  }
}

export {
  defaultConversation,
  setConversationManager,
  getConversationManager,
  clearConversationManager,
}
