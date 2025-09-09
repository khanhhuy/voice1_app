function audioBufferToArrayBuffer (audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length
  
  // Convert to 16-bit PCM
  const arrayBuffer = new ArrayBuffer(length * numberOfChannels * 2)
  const view = new Int16Array(arrayBuffer)
  let offset = 0
      
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i]
      // Convert from [-1, 1] to 16-bit integer
      view[offset] = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
      offset++
    }
  }
  return arrayBuffer
}

export class AudioResampler {

  private audioContext: AudioContext
  private originalSampleRate: number

  constructor (originalSampleRate = 48000) {
    this.originalSampleRate = originalSampleRate
    this.audioContext = new AudioContext({ sampleRate: originalSampleRate })
  }

  // Convert WAV ArrayBuffer to AudioBuffer
  async convertWavToAudioBuffer (wavArrayBuffer: ArrayBuffer) {
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(wavArrayBuffer)
      return audioBuffer
    } catch (error) {
      console.error('Error decoding audio data:', error)
      throw error
    }
  }

  async processRawPCM (rawArrayBuffer: ArrayBuffer, targetSampleRate = 16000) {
    // Convert raw 16-bit PCM to AudioBuffer
    const samples = new Int16Array(rawArrayBuffer)
    const floatSamples = new Float32Array(samples.length)
    
    // Convert to [-1, 1] range
    for (let i = 0; i < samples.length; i++) {
      floatSamples[i] = samples[i] / 32768.0
    }
    
    // Create AudioBuffer
    const audioBuffer = this.audioContext.createBuffer(1, floatSamples.length, this.originalSampleRate)
    audioBuffer.getChannelData(0).set(floatSamples)
    
    const resampledBuffer = await this.resampleAudio(audioBuffer, targetSampleRate)
    return audioBufferToArrayBuffer(resampledBuffer)
  }

  async resampleAudio (inputBuffer: AudioBuffer, targetSampleRate: number): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      inputBuffer.numberOfChannels,
      inputBuffer.duration * targetSampleRate,
      targetSampleRate
    )

    const source = offlineContext.createBufferSource()
    source.buffer = inputBuffer
    source.connect(offlineContext.destination)
    source.start()

    const resampledBuffer = await offlineContext.startRendering()
    return resampledBuffer
  }
}