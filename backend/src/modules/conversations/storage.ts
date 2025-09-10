import { randomUInt32 } from "@/services/utils"
import { ConversationState } from "./conversation_state"
import { ConversationManager } from "./conversationManager"

const STORE_CONVERSATION_MANAGER: {
  [userId: string]: {
    [sessionId: string]: ConversationManager
  }
} = {}

function genSessionId(): string {
  return randomUInt32().toString()
}

function defaultConversation(userId: string) {
  const sessionId = genSessionId()
  const conversationState = new ConversationState(sessionId, userId)

  return conversationState
}

function setConversationManager(userId: string, sessionId: string, conversationManager: ConversationManager) {
  STORE_CONVERSATION_MANAGER[userId] = STORE_CONVERSATION_MANAGER[userId] || {}
  STORE_CONVERSATION_MANAGER[userId][sessionId] = conversationManager
}

function getConversationManager(userId: string, sessionId: string) {
  return STORE_CONVERSATION_MANAGER[userId][sessionId]
}

function clearSession(userId: string, sessionId: string | null) {
  if (!STORE_CONVERSATION_MANAGER[userId]) {
    return
  }

  if (sessionId) {
    delete STORE_CONVERSATION_MANAGER[userId][sessionId]
  } else {
    delete STORE_CONVERSATION_MANAGER[userId]
  }
}

export {
  defaultConversation,
  setConversationManager,
  getConversationManager,
  clearSession,
}
