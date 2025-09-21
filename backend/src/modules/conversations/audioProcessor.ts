import { WebSocket } from "ws";
import { logger } from "@/logger";
import type { SpeechEvent } from "../../core/types/core";
import { TranscriptionService } from "../s2t/transcriptionService";
import { UsageControl } from "@/modules/usage/usageControl";

interface IAudioMessage {
  type: 'speech_start' | 'speech_end'
  ts: number
}

const DEFAULT_CONTEXT_WORDS = 20

class AudioBuffer {
  private buffer: Buffer[] = []

  // each chunk is 100ms, sampling rate is 16000
  addChunk(chunk: Buffer) {
    this.buffer.push(chunk)
  }

  // Given start and end ts, extract the audio buffer
  extractAudio(startMs: number, endMs: number): ArrayBuffer {
    const chunkDurationMs = 100; // Each chunk is 100ms
    const startChunkIndex = Math.floor(startMs / chunkDurationMs);
    const endChunkIndex = Math.floor(endMs / chunkDurationMs);

    // Extract chunks that cover the range
    const relevantChunks: Buffer[] = [];
    for (let i = startChunkIndex; i <= endChunkIndex && i < this.buffer.length; i++) {
      relevantChunks.push(this.buffer[i]);
    }

    // Concatenate all relevant chunks
    const concatenatedBuffer = Buffer.concat(relevantChunks);

    // Clone the buffer to prevent issues if original buffer is deleted later
    const clonedArrayBuffer = concatenatedBuffer.buffer.slice(
      concatenatedBuffer.byteOffset,
      concatenatedBuffer.byteOffset + concatenatedBuffer.byteLength
    );
    
    return clonedArrayBuffer;
  }

}
export class AudioProcessor {
  private ws: WebSocket | null = null
  private sessionId: string
  private onTranscription: (event: SpeechEvent) => void
  // TODO: clean up already processed buffers to reduce memory
  private audioBuffer: AudioBuffer = new AudioBuffer()
  private startTs: number = 0
  private endTs: number = 0
  private transcriptionService: TranscriptionService
  private usageControl: UsageControl

  constructor(
    sessionId: string,
    onTranscription: (event: SpeechEvent) => void,
    usageControl: UsageControl
  ) {
    this.sessionId = sessionId
    this.onTranscription = onTranscription
    this.usageControl = usageControl

    this.transcriptionService = new TranscriptionService(DEFAULT_CONTEXT_WORDS, onTranscription, usageControl)
  }

  async init () {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${process.env.VAD_SERVER}/`)

      this.ws.on('open', () => {
        logger.info('Connected to VAD server for session', this.sessionId)
        resolve(true)
      })

      this.ws.on('message', (data: Buffer) => {
        const message: IAudioMessage = JSON.parse(data.toString())
        this.handleMessage(message)
      })

      this.ws.on('error', (error) => {
        logger.error('Error connecting to VAD server for session', this.sessionId, error)
        reject(error)
      })
    })
  }

  async close() {
    this.ws?.close()
  }

  handleMessage(message: IAudioMessage) {
    if (message.type === 'speech_start') {
      this.startTs = message.ts
      this.onTranscription({
        type: 'start-speech',
      })
    } else if (message.type === 'speech_end') {
      this.endTs = message.ts
      const speechSegment = this.audioBuffer.extractAudio(this.startTs * 1000, this.endTs * 1000)

      // do not await this
      this.transcriptionService.startTranscription(Buffer.from(speechSegment), this.startTs * 1000, this.endTs * 1000)

      this.onTranscription({
        type: 'end-speech',
      })
    }
  }

  receiveRawAudioChunk(chunk: Buffer<ArrayBufferLike>) {
    if (!this.ws) {
      throw new Error('WebSock {et not ready')
    }

    this.audioBuffer.addChunk(chunk)
    this.ws.send(chunk)
  }
}

