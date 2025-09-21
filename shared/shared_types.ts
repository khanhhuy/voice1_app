interface IUser {
  id: string
  team_id: string
  email: string
  display_name: string
  settings: object
}

interface IAssistantReply {
  type: 'reply_start' | 'reply_end'
  text?: string
}

namespace ClientServerEvent {
  export interface EndConvoEvent {
    type: 'end-convo'
    payload: {
      sessionId: string
    }
  }

  export type ConvoEvent = EndConvoEvent
}

export type {
  IUser,
  IAssistantReply,
  ClientServerEvent
}

