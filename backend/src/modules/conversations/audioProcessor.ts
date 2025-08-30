import { WebSocket } from "ws";
import type { ITranscription, ITranscriptionEvent, SpeechEvent } from "../../types";
import { WhisperGroq } from "../s2t/whisper_groq";
import { ConvoLogger } from "@/services/convoLogger";

/**
 * - Receive audio chunk (100ms) from the browser as Uint8Array
 * - Forward the chunk to the python Vad server via websocket
 * - Receive speech chunks (32ms), there is a start and end chunks for each speech
 * - Transcribe the speech chunk immediately after receving the end chunk
 * - Return: the transcriptions, start signal (when the first start chunk is received)
 * - Open a websocket connection to the python Vad server and keep it alive until receive end of session
 * - In one session, we only spawn one instance of this class. There is a global store somewhere to keep the mapping
 *   between the sessionId and the instance of this class.
 * 
 */

interface IAudioMessage {
  type: 'start' | 'end'
  ts: number
}


export class AudioProcessor {
  private ws: WebSocket | null = null
  private isConnected: boolean = false
  private sessionId: string
  private onTranscription: (event: SpeechEvent) => void
  private processedAudio: Buffer[] = []
  private logger: ConvoLogger

  constructor(
    sessionId: string,
    onTranscription: (event: SpeechEvent) => void,
    logger: ConvoLogger,
  ) {
    this.sessionId = sessionId
    this.onTranscription = onTranscription
    this.logger = logger
  }

  async init () {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${process.env.VAD_SERVER}/`)

      this.ws.on('open', () => {
        console.log('Connected to VAD server for session', this.sessionId)
        this.isConnected = true
        resolve(true)
      })

      this.ws.on('message', (data: Buffer) => {
        if (data[0] === 0x7B) {
          const message: IAudioMessage = JSON.parse(data.toString())
          this.handleMessage(message)
        } else {
          this.handleAudioChunk(data)
        }
      })

      this.ws.on('error', (error) => {
        console.error('Error connecting to VAD server for session', this.sessionId, error)
        reject(error)
      })
    })
  }

  handleMessage(message: IAudioMessage) {
    if (message.type === 'start') {
      this.processedAudio = []
      this.onTranscription({
        type: 'start-speech',
      })
      this.logger.log({type: 'vad', sessionId: this.sessionId, ts: Date.now(), status: 'start-speech',})
    } else if (message.type === 'end') {
      // do not await this
      this.startTranscription(Buffer.concat(this.processedAudio))
      this.processedAudio = []
      this.logger.log({ type: 'vad', sessionId: this.sessionId, ts: Date.now(), status: 'end-speech',})
    }
  }

  handleAudioChunk(chunk: Buffer<ArrayBufferLike>) {
    this.processedAudio.push(chunk)
  }

  receiveRawAudioChunk(chunk: Buffer<ArrayBufferLike>) {
    if (!this.ws) {
      throw new Error('WebSocket not ready')
    }

    console.log('Sending chunk to VAD server')
    console.log('Chunk size', chunk.length)

    this.ws.send(chunk)

    this.logger.log({
      type: 'raw-audio-chunk',
      sessionId: this.sessionId,
      ts: Date.now(),
    })
  }

  async startTranscription(buffer: Buffer) {
    const service = new WhisperGroq()
    const transcriptionEvent: ITranscriptionEvent = {
      type: 'transcription',
      status: 'new',
      transcriptions: [],
    }

    this.onTranscription(transcriptionEvent)
    this.onTranscription({
      type: 'end-speech',
    })

    const start = Date.now()
    const transcriptions = await service.transcribe(buffer)
    const end = Date.now()

    this.logger.log({
      type: 'transcription-event',
      sessionId: this.sessionId,
      startTime: start,
      endTime: end,
      transcriptions: transcriptions,
    })

    if (transcriptions.length > 0) {
      transcriptionEvent.status = 'transcribed'
      transcriptionEvent.transcriptions = transcriptions
    } else {
      transcriptionEvent.status = 'ignored'
    }
  }
}

