import { randomUInt32 } from "@/services/utils"
import { ConversationState } from "./conversation_state"
import { ConversationManager } from "./conversation_manager"

const STORE_CONVERSATIONS: {
  [userId: string]: {
    [sessionId: string]: ConversationState
  }
} = {}

const STORE_CONVERSATION_MANAGER: {
  [userId: string]: {
    [sessionId: string]: ConversationManager
  }
} = {}

const STORE_AUDIO_STREAMS: {
  [streamId: string]: Buffer
} = {}

function genSessionId(): string {
  return randomUInt32().toString()
}

function defaultConversation(userId: string) {
  const sessionId = genSessionId()
  const conversationState = new ConversationState(sessionId, userId)

  return conversationState
}

function getConversation(userId: string, sessionId: string) {
  return STORE_CONVERSATIONS[userId][sessionId]
}

function setConversation(userId: string, conversationState: ConversationState) {
  STORE_CONVERSATIONS[userId] = STORE_CONVERSATIONS[userId] || {}
  STORE_CONVERSATIONS[userId][conversationState.getConversation().sessionId] = conversationState
}

function deleteConversation(userId: string, sessionId: string) {
  delete STORE_CONVERSATIONS[userId][sessionId]
}

function setConversationManager(userId: string, sessionId: string, conversationManager: ConversationManager) {
  STORE_CONVERSATION_MANAGER[userId] = STORE_CONVERSATION_MANAGER[userId] || {}
  STORE_CONVERSATION_MANAGER[userId][sessionId] = conversationManager
}

function getConversationManager(userId: string, sessionId: string) {
  return STORE_CONVERSATION_MANAGER[userId][sessionId]
}

function setAudioStream(streamId: string, audioStream: Buffer) {
  STORE_AUDIO_STREAMS[streamId] = audioStream
}

function getAudioStream(streamId: string) {
  return STORE_AUDIO_STREAMS[streamId]
}

export {
  defaultConversation,
  getConversation,
  setConversation,
  deleteConversation,
  setConversationManager,
  getConversationManager,
  setAudioStream,
  getAudioStream
}
