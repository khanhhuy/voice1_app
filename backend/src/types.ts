import type ModelUser from './models/User'

interface IUser {
  id: string
  name: string
  email: string
}

interface ITranscription {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

// Grok Whisper API
interface ITranscriptionSegment {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

interface ITranscriptionWord {
  word: string
  start: number
  end: number
}
interface ITranscriptionFull {
  segments: ITranscriptionSegment[] | null
  words: ITranscriptionWord[] | null
}

interface ITranscriptionEvent {
  type: 'transcription'
  status: 'new' | 'transcribed' | 'ignored'
  transcription: string
  updatedAt: number
}

interface IAudioChunk {
  sequence: number
  audioBuffer: Buffer
  timestamp: number
  transcriptions?: ITranscription[]
  text?: string
  status: 'unprocessed' | 'transcribing' | 'transcribed' | 'failed'
  lastSeen?: number
  retryCount: number
  processingId?: string // Track which async process is handling this
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
  speechStreamId?: string
  status: 'wait-speaking' | 'generating-text' | 'generated-text' | 'generating-speech' | 'streaming-speech' | 'streamed-speech' | 'completed' | 'cancelled'
  startTime: number
  endTime?: number
  retryCount: number
  processingId?: string // Track which async process is handling this
}

interface IConversation {
  sessionId: string
  userId: string
  userTurns: IUserTurn[]
  assistantTurns: IAssistantTurn[]
  startTime: number
  endTime?: number
  lastSequenceNumber: number // Track the last processed sequence
}

type SignalType = 'stop' | 'end-convo' | 'start-speaking'

// Signal type to distinguish from audio chunks
interface IStopSignal {
  type: 'stop'
  sessionId: string
  sequence: number
  timestamp: number
}

interface IEndConvoSignal {
  type: 'end-convo'
  sessionId: string
  timestamp: number
}

interface IStartSpeakingSignal {
  type: 'start-speaking'
  sessionId: string
  timestamp: number
}

type AudioBufferItem = Buffer | IStopSignal | IEndConvoSignal | IStartSpeakingSignal

interface IStartSpeechSignal {
  type: 'start-speech'
}

interface IEndSpeechSignal {
  type: 'end-speech'
}

type SpeechEvent = ITranscriptionEvent | IStartSpeechSignal | IEndSpeechSignal

export type {
  IUser, 
  IConversation, 
  ITranscription,
  IAudioChunk,
  IUserTurn,
  IAssistantTurn,
  IStopSignal,
  IEndConvoSignal,
  IStartSpeakingSignal,
  SignalType,
  AudioBufferItem,
  IStartSpeechSignal,
  IEndSpeechSignal,
  ITranscriptionEvent,
  SpeechEvent,
  ITranscriptionFull,
  ITranscriptionSegment,
  ITranscriptionWord,
}