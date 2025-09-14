import { buildAudioChunk } from './buildAudioChunk'
import { AudioResampler } from './resample'
import { AudioProcessor } from './processor'

import { MediaRecorder as ExtendableMediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'
import { RAW_CHUNK_SIZE } from './constants'

function debugRecording (blobs: Blob[]) {
  // Note: this is still 48Khz because the blob is retrieved directly from the mediaRecorder
  const audioBlob = new Blob(blobs, { type: 'audio/wav' })  

  if (blobs.length === 0) {
    return
  }
  
  // play
  const audio = new Audio()
  audio.src = URL.createObjectURL(audioBlob)
  audio.play()

  // save
  const url = URL.createObjectURL(audioBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recording-${Date.now()}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

type OnAudioBuffer = (audioBuffer: ArrayBuffer, sequence: number) => Promise<void>

// 16 bit, 48KHz, 1 channel, each chunk is 100ms, no header
export class MicrophoneService {
  private mediaRecorder: any
  private mediaStream: MediaStream | null = null
  private isRecording = false
  private sequence: number
  private audioBlobs: Blob[] = []
  private resampler: AudioResampler = new AudioResampler()
  private actualSampleRate: number = 16000
  private needsResampling: boolean = false
  private onAudioBuffer: OnAudioBuffer
  private deviceInfo: { deviceId: string; label: string; groupId: string } | null = null

  constructor (onAudioBuffer: OnAudioBuffer) {
    this.sequence = 0
    this.onAudioBuffer = onAudioBuffer
  }

  async startRecording (): Promise<void> {
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

      // Check actual audio settings
      const audioTrack = this.mediaStream.getAudioTracks()[0]
      if (audioTrack) {
        const settings = audioTrack.getSettings()
        this.actualSampleRate = settings.sampleRate || 16000
        this.needsResampling = this.actualSampleRate !== 16000

        console.log(`Audio recording settings: ${this.actualSampleRate}Hz, resampling needed: ${this.needsResampling}`)

        // Get device information
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(device => device.kind === 'audioinput')
        const currentDevice = audioInputs.find(device => device.deviceId === settings.deviceId)

        if (currentDevice) {
          this.deviceInfo = {
            deviceId: currentDevice.deviceId,
            label: currentDevice.label || 'Unknown Microphone',
            groupId: currentDevice.groupId
          }
          console.log(`Using microphone: ${this.deviceInfo.label}`)
        }
        
        // Update resampler with actual sample rate
        if (this.needsResampling) {
          this.resampler = new AudioResampler(this.actualSampleRate)
        }
      }

      this.mediaRecorder = new ExtendableMediaRecorder(this.mediaStream, {
        mimeType: 'audio/wav'
      })

      // Add audio blobs while recording 
      this.mediaRecorder.addEventListener('dataavailable', async (event: BlobEvent) => {
        const audioBuffer = await this.processAudioBuffer(event)
        await this.onAudioBuffer(audioBuffer, this.sequence)
        this.sequence++
      })


      this.mediaRecorder.start(100) // Capture chunks every 100ms
      this.isRecording = true
    } catch (error) {
      this.cleanup()
      throw new Error(`Failed to start recording: ${error}`)
    }
  }

  async processAudioBuffer (event: BlobEvent): Promise<ArrayBuffer> {
    let arrayBuffer = await event.data.arrayBuffer()

    // rawChunkSize is the raw PCM wav size (9600)
    // only the 1st chunk exceeds this size since it contains the header
    if (arrayBuffer.byteLength > RAW_CHUNK_SIZE) {
      console.log('slice the chunk')
      const diff = arrayBuffer.byteLength - RAW_CHUNK_SIZE
      arrayBuffer = arrayBuffer.slice(diff)
    }

    // Only resample if needed
    let finalBuffer: ArrayBuffer
    if (this.needsResampling) {
      finalBuffer = await this.resampler.processRawPCM(arrayBuffer)
    } else {
      finalBuffer = arrayBuffer
    }

    // this.audioBlobs.push(event.data)
    return finalBuffer
  }

  async stopRecording (): Promise < void> {
    if (!this.isRecording || !this.mediaRecorder) {
      return
    }

    // this.debugRecording(this.audioBlobs)

    this.mediaRecorder.stop()
    this.cleanup()
    this.isRecording = false
  }

  getDeviceInfo (): { deviceId: string; label: string; groupId: string } | null {
    return this.deviceInfo
  }

  private cleanup (): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null
    }

    if (this.mediaStream) {
      console.log('stopping media stream')
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }

    this.mediaRecorder = null
  }
}