import OpenAI from 'openai';
import { compact, flatten } from 'lodash';
import { IAssistantTurn, IConversation, IUserTurn } from '@/core/types/core';
import { PROMPT } from './mae_prompt';

const openai = new OpenAI();

interface IMessage {
  role: 'user' | 'assistant' | 'system'
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
  const msg: IMessage[] = [
    {
      role: 'system',
      content: PROMPT,
    },
    ...messages
  ]

  const completion = await openai.chat.completions.create({
    messages: msg,
    model: 'gpt-5-mini-2025-08-07',
    temperature: 1,
    max_completion_tokens: 4096,
    top_p: 1,
    stream: false,
    stop: null
  });

  return completion.choices[0]?.message?.content || ''
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