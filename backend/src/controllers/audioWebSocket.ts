import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { clearSession, getConversationManager } from '@/modules/conversations/storage'
import { requestContext } from '@/services/requestContext'
import User from '@/models/User'
import type { ClientServerEvent } from '@shared/shared_types'

async function dispatchBinaryChunk(data: Buffer) {
  const userId = requestContext.currentUserId()
  const sessionId = data.readUint32BE(0)
  const sequence = data.readUInt32BE(4)
  const payloadLength = data.readUint32BE(8)

  if (data.length < 12 + payloadLength) {
    throw new Error('Invalid chunk format: incomplete payload')
  }

  const audioBuffer = data.subarray(12, 12 + payloadLength)

  const convoManager = getConversationManager(userId, sessionId.toString())

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
  const sessionId = message.payload.sessionId

  const convoManager = getConversationManager(userId, sessionId)

  if (!convoManager) {
    throw new Error('Conversation manager not found')
  }

  switch (message.type) {
    case 'end-convo':
      convoManager.receiveEndConvoSignal(message)
      clearSession(userId, sessionId)
      console.log('********** Conversation ended **********', "user: ", userId, "session: ", sessionId)
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
    console.log('New audio WebSocket connection established')

    ws.on('message', (data: Buffer) => {
      requestContext.run({ user, ws }, () => {
        try {
          // Check if it's a JSON control message or binary audio data
          if (data[0] === 0x7B) { // '{' character - JSON message
            const message: ClientServerEvent.ConvoEvent = JSON.parse(data.toString())
            this.handleMessage(ws, message)
          } else {
            // Binary audio data - treat as chunk
            this.handleBinaryChunk(ws, data)
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
          this.sendError(ws, 'Error processing message')
        }
      })
    })

    ws.on('close', () => {
      clearSession(user.id, null)
      console.log('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  private handleMessage(ws: WebSocket, message: ClientServerEvent.ConvoEvent) {
    dispatchSignal(message)
  }

  private handleBinaryChunk(ws: WebSocket, data: Buffer) {
    dispatchBinaryChunk(data)
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      message: error
    })
  }
}