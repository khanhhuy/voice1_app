import type { IUsage, IConversation } from './core'

namespace ISession {
  export interface Data {
    conversation: IConversation
    usage: IUsage.Usage
  }
}

export type {
  ISession,
}