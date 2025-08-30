import { buildAudioChunk } from './buildAudioChunk'
import { AudioProcessor } from './processor'

export class MicrophoneService {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private isRecording = false
  private sessionId: string
  private sequence: number

  constructor (sessionId: string, sequence: number) {
    this.sessionId = sessionId
    this.sequence = 0
  }

  async startRecording (processor: AudioProcessor): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress')
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      this.audioContext = new AudioContext({ sampleRate: 16000 })

      const options = { mimeType: 'audio/webm;codecs=opus' }
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options)

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && processor.isConnected) {
          const arrayBuffer = await event.data.arrayBuffer()
          console.log('ondataavailable', arrayBuffer.byteLength)
          const audioData = await buildAudioChunk(this.sessionId, this.sequence, arrayBuffer)
          this.sequence++
          void processor.sendRaw(audioData)
        }
      }

      this.mediaRecorder.start(1000) // Capture chunks every 100ms
      this.isRecording = true
    } catch (error) {
      this.cleanup()
      throw new Error(`Failed to start recording: ${error}`)
    }
  }

  async stopRecording (): Promise<void> {
    if (!this.isRecording || !this.mediaRecorder) {
      return
    }

    this.mediaRecorder.stop()
    this.cleanup()
    this.isRecording = false
  }

  private cleanup (): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.mediaRecorder = null
  }

  get recordingState (): boolean {
    return this.isRecording
  }
}