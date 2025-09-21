import Anthropic from '@anthropic-ai/sdk';
import { compact, flatten } from 'lodash';
import { IAssistantTurn, IConversation, IUserTurn } from '@/core/types/core';
import { PROMPT } from './mae_prompt';

const client = new Anthropic();

interface IMessage {
  role: 'user' | 'assistant'
  content: string
}

function buildMessagesFromConversation(conversation: IConversation): IMessage[] {
  const userTurns = conversation.userTurns
  const assistantTurns = conversation.assistantTurns

  const mapResponseIdToAssistantTurn = new Map<string, IAssistantTurn>()

  for (const turn of assistantTurns) {
    mapResponseIdToAssistantTurn.set(turn.responseToTurnId, turn)
  }

  const messages: IMessage[][] = userTurns.map((turn: IUserTurn) => {
    let userMsg: IMessage | null = null

    if (turn.cachedText) {
      userMsg = {
        role: 'user',
        content: turn.cachedText
      }
    }

    const assistantTurn = mapResponseIdToAssistantTurn.get(turn.id)

    let assistantMsg: IMessage | null = null

    if (assistantTurn && assistantTurn.status === 'completed') {
      assistantMsg = {
        role: 'assistant',
        content: assistantTurn.repliedText || ''
      }
    }

    return compact([
      userMsg,
      assistantMsg
    ])
  })

  return flatten(messages)
}

async function llmCompletion(messages: IMessage[]): Promise<string> {
  const msg: IMessage[] = [...messages]

  const promise: Promise<string> = new Promise((resolve, reject) => {
    let fullText = ''

    client.messages.stream({
      system: [
        {
          type: 'text',
          text: PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: msg,
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
    }).on('text', (text) => {
      fullText += text
    }).on('end', () => {
      resolve(fullText)
    }).on('error', (error) => {
      reject(error)
    }).on('message', (msg) => {
      console.log(msg.usage)
    })
  })

  return promise
}

async function generateText(conversation: IConversation, forUserTurnId: string): Promise<{ text: string, responseToTurnId: string }> {
  const messages = buildMessagesFromConversation(conversation)
  const completion = await llmCompletion(messages)

  return {
    text: completion,
    responseToTurnId: forUserTurnId
  }
}

export { generateText }