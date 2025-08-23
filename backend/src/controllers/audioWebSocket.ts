import { WebSocket, WebSocketServer } from 'ws'
import type { IStopSignal, IEndConvoSignal, SignalType, IStartSpeakingSignal } from "@/types"
import { IncomingMessage } from 'http'
import { getConversationManager } from '@/modules/conversations/storage'
import { requestContext } from '@/services/requestContext'
import User from '@/models/User'

interface ISignal {
  type: SignalType
  payload: any
}

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
    convoManager.start()
  }

  convoManager.receiveAudio(audioBuffer, sequence)
}

async function dispatchSignal(sessionId: string, signal: SignalType, payload: any) {
  const userId = requestContext.currentUserId()
  const convoManager = getConversationManager(userId, sessionId)

  if (!convoManager) {
    throw new Error('Conversation manager not found')
  }

  switch (signal) {
    case 'start-speaking':
      convoManager.receiveStartSpeakingSignal(payload as IStartSpeakingSignal)
      break
    case 'stop':
      convoManager.receiveStopSignal(payload as IStopSignal)
      break
    case 'end-convo':
      convoManager.receiveEndConvoSignal(payload as IEndConvoSignal)
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
            const message: ISignal = JSON.parse(data.toString())
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
      // const userId = requestContext.currentUserId()
      // TODO: Close all active conversations for this user
      console.log('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  private handleMessage(ws: WebSocket, message: ISignal) {
    dispatchSignal(message.payload.sessionId, message.type, message.payload)
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