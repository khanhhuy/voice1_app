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

export type { IUser, IAssistantReply }
