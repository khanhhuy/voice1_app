interface ITranscriptionEvent {
  type: 'transcription'
  status: 'new' | 'transcribed' | 'ignored'
  transcription: string
  updatedAt: number
}

interface IUserTurn {
  id: string
  type: 'userTurn'
  participantId: string
  chunks: ITranscriptionEvent[]
  cachedText?: string
  status: 'new' | 'speaking' | 'wait-replying' | 'completed'
  allTranscribed: boolean
  finishedAt: number
  startTime: number
  endTime?: number
}

interface IAssistantTurn {
  id: string
  type: 'assistantTurn'
  participantId: string
  responseToTurnId: string
  repliedText?: string
  status: 'wait-speaking' | 'generating-text' | 'generated-text' | 'generating-speech' | 'streaming-speech' | 'streamed-speech' | 'completed' | 'cancelled'
  startTime: number
  endTime?: number
  retryCount: number
  processingId?: string // Track which async process is handling this
}

type ConversationStatus = 'created' | 'in_progress' | 'paused' | 'completed' | 'failed'
interface IConversation {
  sessionId: string
  userId: string
  userTurns: IUserTurn[]
  assistantTurns: IAssistantTurn[]
  startTime: number
  endTime?: number
  status: ConversationStatus
}

interface IStartSpeechSignal {
  type: 'start-speech'
}

interface IEndSpeechSignal {
  type: 'end-speech'
}

type SpeechEvent = ITranscriptionEvent | IStartSpeechSignal | IEndSpeechSignal

export type {
  ITranscriptionEvent,
  IUserTurn,
  IAssistantTurn,
  IConversation,
  IStartSpeechSignal,
  IEndSpeechSignal,
  SpeechEvent,
  ConversationStatus,
}
