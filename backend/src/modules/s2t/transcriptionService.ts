import { ITranscriptionEvent, SpeechEvent } from "@/types"
import { WhisperGroq } from "./whisperGroq"
import { DedupService } from "./dedupService"
import { isEmpty } from "lodash"

const whisperGroq = new WhisperGroq()

// It seems that adding a small gap makes the transcription more stable.
const BUFFER_GAP_S = 0.3
interface BufferHistory {
  buffer: Buffer
  text: string
}

export class TranscriptionService {
  private onTranscription: (event: SpeechEvent) => void
  private contextWords: number
  private bufferHistory: BufferHistory[] = []
  private processingQueue: Array<{ buffer: Buffer, start: number, end: number }> = []
  private isProcessing: boolean = false
  private dedupService: DedupService

  constructor(contextWords: number, onTranscription: (event: SpeechEvent) => void) {
    this.onTranscription = onTranscription
    this.contextWords = contextWords
    this.dedupService = new DedupService()
  }

  async startTranscription(buffer: Buffer, start: number, end: number) {
    // Add to queue for serial processing
    this.processingQueue.push({ buffer, start, end })

    // Start processing if not already processing
    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  private async processQueue() {
    this.isProcessing = true

    while (this.processingQueue.length > 0) {
      const { buffer } = this.processingQueue.shift()!
      await this.processBuffer(buffer)
    }

    this.isProcessing = false
  }

  private async processBuffer(buffer: Buffer) {
    const transcriptionEvent: ITranscriptionEvent = {
      type: 'transcription',
      status: 'new',
      transcription: ''
    }

    this.onTranscription(transcriptionEvent)
    this.onTranscription({
      type: 'end-speech',
    })

    // Get recent buffers within context window
    const recentBuffers = this.getRecentBuffers()
    const contextText = recentBuffers.map(bh => bh.text).join(' ')

    const combinedBuffer = this.combineBuffers([...recentBuffers.map(bh => bh.buffer), buffer])
    const segments = await whisperGroq.transcribe(combinedBuffer)

    const finalText = segments.map(s => s.text).join(' ')

    if (isEmpty(finalText)) {
      transcriptionEvent.status = 'ignored'
      return
    }

    const newText = this.dedupService.dedup(contextText, finalText)
    if (isEmpty(newText)) {
      transcriptionEvent.status = 'ignored'
      return
    }

    this.bufferHistory.push({
      buffer,
      text: newText,
    })

    this.cleanupBufferHistory()

    transcriptionEvent.status = 'transcribed'
    console.log('==> Transcription: \x1b[33m' + newText + '\x1b[0m')
    transcriptionEvent.transcription = newText
  }

  private countCutoffIdx(words: number): number {
    let pastWords = 0
    let idx = this.bufferHistory.length - 1
    while (pastWords < words && idx >= 0) {
      pastWords += this.bufferHistory[idx].text.split(' ').length
      idx--
    }

    return idx + 1
  }

  private getRecentBuffers(): BufferHistory[] {
    if (this.bufferHistory.length === 0) {
      return []
    }

    const idx = this.countCutoffIdx(this.contextWords)

    return this.bufferHistory.slice(idx)
  }

  private combineBuffers(buffers: Buffer[]): Buffer {
    if (buffers.length === 0) {
      return Buffer.alloc(0)
    }
    if (buffers.length === 1) {
      return buffers[0]
    }

    const gapDurationMs = BUFFER_GAP_S * 1000
    const sampleRate = 16000 // 16kHz
    const bytesPerSample = 2 // 16-bit = 2 bytes
    const gapSamples = Math.floor((gapDurationMs / 1000) * sampleRate)
    const gapBuffer = Buffer.alloc(gapSamples * bytesPerSample, 0) // Silent audio

    const buffersWithGaps: Buffer[] = []

    for (let i = 0; i < buffers.length; i++) {
      buffersWithGaps.push(buffers[i])
      if (i < buffers.length - 1) {
        buffersWithGaps.push(gapBuffer)
      }
    }

    return Buffer.concat(buffersWithGaps)
  }

  private cleanupBufferHistory(): void {
    const cutoffIdx = this.countCutoffIdx(this.contextWords)

    // -3 to keep some buffer history
    this.bufferHistory = this.bufferHistory.filter((_, idx) => idx >= (cutoffIdx - 3))
  }
}
