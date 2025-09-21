import { Groq } from 'groq-sdk';
import { compact, flatten } from 'lodash';
import { IAssistantTurn, IConversation, IUserTurn } from '@/core/types/core';
import {  PROMPT } from './mae_prompt';
// import { GEMINI_PROMPT_1 as PROMPT } from './gemini_prompt1';

const groq = new Groq();

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

  const stream = await groq.chat.completions.create({
    "messages": msg,
    "model": "moonshotai/kimi-k2-instruct", // "deepseek-r1-distill-llama-70b", // "moonshotai/kimi-k2-instruct", // "openai/gpt-oss-120b",
    // "reasoning_effort": "medium",
    // "reasoning_format": "hidden",
    "temperature": 1,
    "max_completion_tokens": 4096,
    "top_p": 1,
    "stream": true,
    "stop": null
  });

  let text = ''

  for await (const chunk of stream) {
    // Print the completion returned by the LLM.
    text += chunk.choices[0]?.delta?.content || ""
  }

  return text
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