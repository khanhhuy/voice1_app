import { buildAudioChunk } from './buildAudioChunk'
import { AudioResampler } from './resample'
import { AudioProcessor } from './processor'

import { MediaRecorder as ExtendableMediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'

// 16 bit, 48KHz, 1 channel, each chunk is 100ms, no header
const RAW_CHUNK_SIZE = 9600 
export class MicrophoneService {
  private mediaRecorder: any
  private mediaStream: MediaStream | null = null
  private isRecording = false
  private sessionId: string
  private sequence: number
  private audioBlobs: Blob[] = []
  private resampler: AudioResampler = new AudioResampler()

  constructor (sessionId: string, sequence: number) {
    this.sessionId = sessionId
    this.sequence = 0
  }

  async startRecording (processor: AudioProcessor): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress')
    }

    await register(await connect())

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          // noiseSuppression: true
        }
      })

      this.mediaRecorder = new ExtendableMediaRecorder(this.mediaStream, {
        mimeType: 'audio/wav'
      })

      // Add audio blobs while recording 
      this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        void this.handleDataAvailable(event, processor)
      })


      this.mediaRecorder.start(100) // Capture chunks every 100ms
      this.isRecording = true
    } catch (error) {
      this.cleanup()
      throw new Error(`Failed to start recording: ${error}`)
    }
  }

  async handleDataAvailable (event: BlobEvent, processor: AudioProcessor): Promise<void> {
    if (event.data.size > 0 && processor.isConnected) {
      let arrayBuffer = await event.data.arrayBuffer()

      if (arrayBuffer.byteLength > RAW_CHUNK_SIZE) {
        const diff = arrayBuffer.byteLength - RAW_CHUNK_SIZE
        arrayBuffer = arrayBuffer.slice(diff)
      }

      const sampledBuffer = await this.resampler.processRawPCM(arrayBuffer)

      const audioData = await buildAudioChunk(this.sessionId, this.sequence, sampledBuffer)
      this.sequence++
      void processor.sendRaw(audioData)
      // this.audioBlobs.push(event.data)
    }
  }

  async resampleAudio (inputBuffer: AudioBuffer, targetSampleRate: number): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      1, // channels
      inputBuffer.duration * targetSampleRate, // length
      targetSampleRate // sample rate
    )
  
    const source = offlineContext.createBufferSource()
    source.buffer = inputBuffer
    source.connect(offlineContext.destination)
    source.start()
  
    const resampledBuffer = await offlineContext.startRendering()
    return resampledBuffer
  }

  async stopRecording (): Promise < void> {
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

    this.mediaRecorder = null
  }

  playRecording (): void {
    // Note: this is still 48Khz because the blob is retrieved directly from the mediaRecorder
    const audioBlob = new Blob(this.audioBlobs, { type: 'audio/wav' })  
    if (this.audioBlobs) {
      const audio = new Audio()
      audio.src = URL.createObjectURL(audioBlob)
      audio.play()
      this.saveRecording(audioBlob)
    }
  }

  saveRecording (audioBlob: Blob): void {
    if (audioBlob.size > 0) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recording-${this.sessionId}-${Date.now()}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }


  get recordingState (): boolean {
    return this.isRecording
  }
}