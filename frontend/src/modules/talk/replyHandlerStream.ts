import { ref } from 'vue'
import { createEventHook } from '@vueuse/core'
import type { IAssistantReply } from '@shared/shared_types'

const GLOBAL_BUFFER_MAP = new Map<string, { buffer: AudioBufferSourceNode, ended: boolean }>()

// TODO: should have a better way to pause audio
const CAN_PLAY_AUDIO = ref(true)

const audioPlayingEvent = createEventHook<number>()
const replyEvent = createEventHook<IAssistantReply>()

class ReplyHandler {
  private audioContext: AudioContext
  private sampleRate: number = 48000
  private nextStartTime: number = 0
  private counter: number = new Date().getTime()

  constructor () {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  // Convert raw PCM bytes to AudioBuffer
  private createAudioBuffer (pcmData: ArrayBuffer): AudioBuffer | null {
    // Check if we have data
    if (pcmData.byteLength === 0) {
      console.warn('Received empty audio chunk')
      return null
    }

    const pcmArray = new Int16Array(pcmData)
    const floatArray = new Float32Array(pcmArray.length)
    
    // Convert 16-bit PCM to float32 (-1 to 1 range)
    for (let i = 0; i < pcmArray.length; i++) {
      floatArray[i] = pcmArray[i] / 32768.0
    }

    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      floatArray.length,
      this.sampleRate
    )
    
    audioBuffer.getChannelData(0).set(floatArray)
    return audioBuffer
  }

  private trackBuffer (buffer: AudioBufferSourceNode) {
    const counter = new Date().getTime()
    GLOBAL_BUFFER_MAP.set(counter.toString(), { buffer, ended: false })
  }

  private removeBuffer (counter: number) {
    GLOBAL_BUFFER_MAP.delete(counter.toString())
  }

  // Queue and play audio buffer
  private scheduleBuffer (audioBuffer: AudioBuffer) {
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)

    const currentTime = this.audioContext.currentTime
    
    // Schedule seamless playback
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime
    }

    this.trackBuffer(source)
    
    source.start(this.nextStartTime)
    this.nextStartTime += audioBuffer.duration

    audioPlayingEvent.trigger(audioBuffer.duration)

    // Cleanup after playback
    source.onended = () => {
      source.disconnect()
      this.removeBuffer(this.counter)
    }
  }

  // Handle incoming audio chunk - FIXED to handle Blob
  async processAudioChunk (data: Blob | ArrayBuffer) {
    if (!CAN_PLAY_AUDIO.value) {
      return
    }

    let arrayBuffer: ArrayBuffer
    
    // Convert Blob to ArrayBuffer if needed
    if (data instanceof Blob) {
      arrayBuffer = await data.arrayBuffer()
    } else {
      arrayBuffer = data
    }
    
    // Skip empty chunks
    if (arrayBuffer.byteLength === 0) {
      console.log('Skipping empty audio chunk')
      return
    }
    
    const audioBuffer = this.createAudioBuffer(arrayBuffer)
    if (audioBuffer) {
      this.scheduleBuffer(audioBuffer)
    }
  }

  private handleSignal (msg: IAssistantReply) {
    if (msg.type === 'reply_start') {
      this.nextStartTime = 0
    } else if (msg.type === 'reply_end') {
    }

    replyEvent.trigger(msg)
  }

  async handleMessage (event: MessageEvent) {
    const data = event.data

    if (typeof data === 'string') {
      const msg = JSON.parse(data)
      this.handleSignal(msg as IAssistantReply)
    } else {
      // Process binary audio data
      await this.processAudioChunk(data)
    }
  }
}

export { ReplyHandler, audioPlayingEvent, replyEvent }