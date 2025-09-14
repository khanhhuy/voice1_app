export interface IAgent {
  name: string
  role: string
  avatar: string
  tips: string[]
}

export const AGENTS: IAgent[] = [
  {
    name: 'mae',
    role: 'User-discovery Coach',
    avatar: 'https://voice1-production.sgp1.cdn.digitaloceanspaces.com/assets/mae.png',
    tips: [
      'How to break the ice and build rapport quickly',
      'How to brief the meeting agenda',
      'How to dig deeper without sounding pushy',
      'How to wrap up with clear next steps',
      'How to handle feature requests you can\'t commit to',
    ]
  },
  {
    name: 'kim',
    role: 'Customer-support Coach',
    avatar: 'https://voice1-production.sgp1.cdn.digitaloceanspaces.com/assets/kim.png',
    tips: [
      'How to handle difficult customers',
      'How to resolve conflicts',
      'How to control damage',
      'How to handle feature requests you can\'t commit to',
    ]
  }
]