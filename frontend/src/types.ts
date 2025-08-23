interface ISignal {
  type: 'stop' | 'end-convo' | 'start-speaking'
  payload: IStopSignal | IEndConvoSignal | IStartSpeakingSignal
}

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

interface IReplyStartSignal {
  type: 'reply_start'
  streamId: string
  totalSize: number
  format: 'mp3'
}

interface IReplyEndSignal {
  type: 'reply_end'
  streamId: string
}

type IReplyControlMessage = IReplyStartSignal | IReplyEndSignal

declare global {
  interface Window {
    voice1: {
      token?: string
    }
  }
}

export type {
  ISignal,
  IStopSignal,
  IEndConvoSignal,
  IReplyControlMessage,
  IReplyStartSignal,
  IReplyEndSignal
}