import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import type { ConversationManager } from '@/modules/conversations/conversationManager'
import { clearConversationManager, getConversationManager } from '@/modules/conversations/storage'
import { requestContext } from '@/services/requestContext'
import { logger } from '@/logger'
import User from '@/models/User'
import type { ClientServerEvent } from '@shared/shared_types'

function stopAndCleanUp (convoManager: ConversationManager, userId: string) {
  convoManager.receiveEndConvoSignal()
  clearConversationManager(userId)
}

async function dispatchBinaryChunk(data: Buffer) {
  const userId = requestContext.currentUserId()
  // TODO: remove this later because we already stored this in storage mapping
  const _sessionId = data.readUint32BE(0)
  const sequence = data.readUInt32BE(4)
  const payloadLength = data.readUint32BE(8)

  if (data.length < 12 + payloadLength) {
    throw new Error('Invalid chunk format: incomplete payload')
  }

  const audioBuffer = data.subarray(12, 12 + payloadLength)

  const convoManager = getConversationManager(userId)

  if (!convoManager) {
    throw new Error('Conversation manager not found')
  }

  if (!convoManager.isStarted) {
    // Need to run this under web socket context
    await convoManager.start()
  }

  convoManager.receiveAudio(audioBuffer, sequence)
}

async function dispatchSignal(message: ClientServerEvent.ConvoEvent) {
  const userId = requestContext.currentUserId()

  const convoManager = getConversationManager(userId)

  if (!convoManager) {
    throw new Error('Conversation manager not found')
  }

  switch (message.type) {
    case 'end-convo':
      stopAndCleanUp(convoManager, userId)
      logger.info('Conversation ended', { userId })
      break
    default:
      throw new Error('Invalid signal type')
  }
}

export class AudioWebSocketService {
  private wss: WebSocketServer

  constructor() {
    this.wss = new WebSocketServer({ noServer: true })
  }

  handleUpgrade(request: IncomingMessage, socket: any, head: Buffer, user: User) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.handleConnection(ws, user)
    })
  }

  private handleConnection(ws: WebSocket, user: User) {
    logger.info('New audio WebSocket connection established', { userId: user.id })

    ws.on('message', (data: Buffer) => {
      requestContext.run({ user, ws }, () => {
        try {
          // Check if it's a JSON control message or binary audio data
          if (data[0] === 0x7B) { // '{' character - JSON message
            const message: ClientServerEvent.ConvoEvent = JSON.parse(data.toString())
            dispatchSignal(message)
          } else {
            dispatchBinaryChunk(data)
          }
        } catch (error) {
          logger.error('Error processing WebSocket message:', { error })
        }
      })
    })

    ws.on('close', () => {
      const convoManager = getConversationManager(user.id)
      if (convoManager) {
        stopAndCleanUp(convoManager, user.id)
      }
      logger.info('WebSocket connection closed', { userId: user.id })
    })

    ws.on('error', (error) => {
      logger.error('WebSocket error:', { error })
    })
  }
}