export interface AudioChangeResult {
  amplitude: number;           // Current RMS amplitude (0-1)
  isSpeaking: boolean;        // Whether currently above threshold
  changeDetected: boolean;    // Whether state changed from previous chunk
  changeType: 'speech_start' | 'speech_stop' | 'none';
  timestamp: number;          // When this analysis occurred
}

export type AudioChangeCallback = (result: AudioChangeResult) => void

export class AudioChangeDetector {
  private threshold: number
  private lastAmplitude: number = 0
  private lastSpeakingState: boolean = false
  private callback?: AudioChangeCallback
  private sampleInterval: number
  
  constructor (
    callback?: AudioChangeCallback,
    threshold: number = 0.005, 
    sampleInterval: number = 20  // Process every Nth sample (1 = all samples, 10 = every 10th)
  ) {
    this.callback = callback
    this.threshold = threshold
    this.sampleInterval = Math.max(1, sampleInterval)
  }

  /**
   * Process an audio chunk and detect changes
   * @param arrayBuffer Raw PCM audio data (no header)
   * @returns AudioChangeResult
   */
  processAudioChunk (arrayBuffer: ArrayBuffer): AudioChangeResult {
    try {
      // Calculate RMS amplitude directly from PCM data
      const amplitude = this.calculateRMSAmplitude(arrayBuffer)
      
      // Determine if speaking
      const isSpeaking = amplitude > this.threshold
      
      // Detect changes
      const changeDetected = isSpeaking !== this.lastSpeakingState
      let changeType: 'speech_start' | 'speech_stop' | 'none' = 'none'
      
      if (changeDetected) {
        changeType = isSpeaking ? 'speech_start' : 'speech_stop'
      }
      
      // Create result
      const result: AudioChangeResult = {
        amplitude,
        isSpeaking,
        changeDetected,
        changeType,
        timestamp: Date.now()
      }
      
      // Update state
      this.lastAmplitude = amplitude
      this.lastSpeakingState = isSpeaking
      
      // Trigger callback if provided
      this.callback?.(result)
      
      return result
    } catch (error) {
      console.error('Failed to process audio chunk:', error)
      
      // Return fallback result
      const fallbackResult: AudioChangeResult = {
        amplitude: 0,
        isSpeaking: false,
        changeDetected: false,
        changeType: 'none',
        timestamp: Date.now()
      }
      
      this.callback?.(fallbackResult)
      return fallbackResult
    }
  }

  private calculateRMSAmplitude (arrayBuffer: ArrayBuffer): number {
    let sum = 0
    let sampleCount = 0
    
    // 16-bit PCM: samples are Int16 (-32768 to 32767)
    const samples = new Int16Array(arrayBuffer)
      
    // Sample every Nth sample for performance
    for (let i = 0; i < samples.length; i += this.sampleInterval) {
      const normalizedSample = samples[i] / 32768 // Normalize to [-1, 1]
      sum += normalizedSample * normalizedSample
      sampleCount++
    }
    const rms = Math.sqrt(sum / sampleCount)

    return Math.min(rms, 1) // Clamp to [0, 1]
  }

  setSampleInterval (interval: number): void {
    this.sampleInterval = Math.max(1, interval)
  }

  getSampleInterval (): number {
    return this.sampleInterval
  }

  setThreshold (newThreshold: number): void {
    this.threshold = Math.max(0, Math.min(1, newThreshold))
  }

  getThreshold (): number {
    return this.threshold
  }

  isSpeaking (): boolean {
    return this.lastSpeakingState
  }

  getLastAmplitude (): number {
    return this.lastAmplitude
  }

  reset (): void {
    this.lastAmplitude = 0
    this.lastSpeakingState = false
  }
}