import { ITranscriptionEvent, SpeechEvent } from "@/types"
import { WhisperGroq, filterOutNonSpeechSegments } from "./whisper_groq"
import { dedupLLM } from "./dedup_groq"
import { countWhisperTokens } from "../usage/tokenUsage"
import { requestContext } from "@/services/requestContext"

const whisperGroq = new WhisperGroq()

interface BufferHistory {
  buffer: Buffer
  transcription: string
  timestamp: number
}

export class TranscriptionService {
  private onTranscription: (event: SpeechEvent) => void
  private contextSizeMs: number
  private bufferHistory: BufferHistory[] = []

  constructor(contextSizeMs: number, onTranscription: (event: SpeechEvent) => void) {
    this.onTranscription = onTranscription
    this.contextSizeMs = contextSizeMs
  }

  async startTranscription(buffer: Buffer, startMs: number, endMs: number) {
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
    const recentBuffers = this.getRecentBuffers(startMs)
    const combinedBuffer = this.combineBuffers([...recentBuffers.map(bh => bh.buffer), buffer])
    
    // Transcribe the combined buffer
    const segments = await whisperGroq.transcribe(combinedBuffer)

    const userId = requestContext.currentUserId()
    // countWhisperTokens(userId, segments)

    const combinedTranscriptions = filterOutNonSpeechSegments(segments)

    const combinedText = combinedTranscriptions.map(t => t.text).join(' ')
    
    // If we have previous context, use dedup to extract the new part
    let finalTranscription = combinedText
    if (recentBuffers.length > 0) {
      const pastTranscription = recentBuffers.map(bh => bh.transcription).join(' ')
      finalTranscription = await dedupLLM(pastTranscription, combinedText)
    }

    console.log('\x1b[33m Transcription:' + finalTranscription + '\x1b[0m')
    console.log('   Combined text:', combinedText)

    // Store this buffer in history
    this.bufferHistory.push({
      buffer,
      transcription: finalTranscription,
      timestamp: startMs
    })

    // Clean up old buffers
    this.cleanupBufferHistory(startMs)

    if (finalTranscription.trim().length > 0) {
      transcriptionEvent.status = 'transcribed'
      transcriptionEvent.transcription = finalTranscription
    } else {
      transcriptionEvent.status = 'ignored'
    }

    return [{ text: finalTranscription }]
  }

  private getRecentBuffers(currentTime: number): BufferHistory[] {
    const cutoffTime = currentTime - this.contextSizeMs
    return this.bufferHistory.filter(bh => bh.timestamp >= cutoffTime)
  }

  private combineBuffers(buffers: Buffer[]): Buffer {
    if (buffers.length === 0) {
      return Buffer.alloc(0)
    }
    if (buffers.length === 1) {
      return buffers[0]
    }
    return Buffer.concat(buffers)
  }

  private cleanupBufferHistory(currentTime: number): void {
    const cutoffTime = currentTime - this.contextSizeMs * 2 // Keep some extra history
    this.bufferHistory = this.bufferHistory.filter(bh => bh.timestamp >= cutoffTime)
  }

}