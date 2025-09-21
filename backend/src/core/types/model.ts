import type { IUsage, IConversation } from './core'

namespace ISession {
  export interface Data {
    conversation: Omit<IConversation, 'sessionId' | 'userId'>
    usage: IUsage.Usage
  }
}

export type {
  ISession,
}