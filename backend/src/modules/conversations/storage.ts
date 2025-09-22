import { ConversationState } from "./conversationState"
import { ConversationManager } from "./conversationManager"

const STORE_CONVERSATION_MANAGER: {
  [sessionId: string]: ConversationManager
} = {}

function defaultConversation(userId: string, sessionId: string) {
  const conversationState = new ConversationState(sessionId, userId)

  return conversationState
}

function setConversationManager(sessionId: string, conversationManager: ConversationManager) {
  STORE_CONVERSATION_MANAGER[sessionId] = conversationManager
}

function getConversationManager(sessionId: string) {
  return STORE_CONVERSATION_MANAGER[sessionId]
}

function getUserFromSession(sessionId: string) {
  return STORE_CONVERSATION_MANAGER[sessionId].conversationState.getUserId()
}

function sessionMeta(sessionId: string) {
  return {
    userId: getUserFromSession(sessionId),
    sessionId,
  }
}

function clearSession(sessionId: string | null) {
  if (sessionId) {
    delete STORE_CONVERSATION_MANAGER[sessionId]
  }
}

export {
  defaultConversation,
  setConversationManager,
  getConversationManager,
  clearSession,
  sessionMeta,
}
