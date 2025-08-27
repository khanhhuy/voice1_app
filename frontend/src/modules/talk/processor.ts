import type { ISignal } from '@/types'
import { ReplyHandler } from './replyHandlerStream'

export interface Options {
  url?: string
}

export class AudioProcessor {
  private ws: WebSocket | null = null
  private currentSessionId: string | null = null
  private isConnecting = false
  private readonly url: string
  private replyHandler: ReplyHandler | null = null

  constructor (sessionId: string, options: Options = {}) {
    const token = window.localStorage.getItem('voice1_token')

    this.url = options.url || `ws://localhost:3006/talk?token=${token}`
    this.currentSessionId = sessionId
    this.replyHandler = new ReplyHandler()
  }

  public async connectWithUpgrade (): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    if (this.isConnecting) {
      return this.waitForConnection()
    }

    return this.establishConnectionWithUpgrade()
  }

  private establishConnectionWithUpgrade (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isConnecting = true
      
      try {
        // TODO: add token via query params to the URL
        // note that we need to use ephemeral token because token is included via query params which is not secure
        this.ws = new WebSocket(this.url)
      } catch (error) {
        this.isConnecting = false
        reject(new Error(`Failed to create WebSocket connection with upgrade: ${error}`))
        return
      }

      const connectionTimeout = setTimeout(() => {
        this.cleanup()
        reject(new Error('Connection upgrade timeout - server may not support protocol upgrade'))
      }, 10000)

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        this.replyHandler = new ReplyHandler()
        resolve()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event)
      }

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        this.disconnect()
      }

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        const errorMsg = `WebSocket connection upgrade error: ${JSON.stringify(error)}`
        reject(new Error(errorMsg))
      }
    })
  }

  private waitForConnection (): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          resolve()
        } else if (!this.isConnecting) {
          reject(new Error('Connection failed'))
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  private handleMessage (event: MessageEvent): void {
    try {
      if (!this.replyHandler) {
        throw new Error('Reply handler is not initialized')
      }

      void this.replyHandler.handleMessage(event)
    } catch (error) {
      console.error('Failed to handle message', error)
    }
  }

  public async sendRaw (message: Uint8Array): Promise<void> {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open')
    }

    this.ws.send(message.buffer)
  }

  public async endSession (sessionId: string, sequence: number): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session to end')
    }

    const message: ISignal = {
      type: 'end-convo',
      payload: {
        type: 'end-convo',
        sessionId,
        timestamp: Date.now()
      }
    }

    this.sendMessage(message)
    this.disconnect()
  }

  public sendMessage (message: ISignal): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open')
    }

    this.ws.send(JSON.stringify(message))
  }

  public disconnect (): void {
    this.cleanup()
  }

  private cleanup (): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.currentSessionId = null
    this.isConnecting = false
    this.replyHandler = null
  }

  public get isConnected (): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  public get connectionState (): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'open'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'closed'
      default: return 'unknown'
    }
  }

  public async checkServerConnection (): Promise<boolean> {
    try {
      const response = await fetch(this.url.replace('ws://', 'http://').replace('wss://', 'https://').replace('/talk', '/ping'))
      return response.ok
    } catch {
      return false
    }
  }
}