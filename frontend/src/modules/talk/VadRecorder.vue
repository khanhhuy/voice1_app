<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
    <h1 class="text-2xl font-bold mb-6">
      Mae
    </h1>
    
    <div class="mb-6">
      <div class="flex gap-4 items-center">
        <Button
          v-if="!isRecording"
          :disabled="isLoading"
          size="lg"
          class="bg-teal-600 hover:bg-teal-700"
          @click="startRecording"
        >
          {{ isLoading ? 'Loading...' : 'Start' }}
        </Button>

        <Button
          v-if="isRecording"
          size="lg"
          class="bg-blue-500 hover:bg-blue-700 cursor-pointer active:bg-blue-800"
          @click="manualSendRecording"
        >
          Stop speaking
        </Button>
        
        <Button
          v-if="isRecording"
          size="lg"
          variant="destructive"
          @click="stopRecording"
        >
          <i class="ri-stop-line mr-2" />
          Stop Recording
        </Button>
        
        <div
          v-if="isRecording"
          class="flex items-center gap-2 text-red-600"
        >
          <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span class="font-medium">Recording... (Voice Activity Detection ON)</span>
        </div>
      </div>
      
      <!-- Status indicators -->
      <div
        v-if="isRecording"
        class="mt-4 flex gap-4 text-sm"
      >
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            ]"
          />
          <span>{{ isSpeaking ? 'Speaking' : 'Silent' }}</span>
        </div>
        
        <div
          v-if="silenceTimer"
          class="flex items-center gap-2 text-amber-600"
        >
          <i class="ri-timer-line" />
          <span>Auto-send in {{ Math.ceil(silenceTimeRemaining / 1000) }}s</span>
        </div>
        
        <div
          v-if="hasSentForCurrentSpeech"
          class="flex items-center gap-2 text-blue-600"
        >
          <i class="ri-check-line" />
          <span>Sent (waiting for new speech)</span>
        </div>
      </div>
    </div>
    
    <RecordsList
      :recordings="recordings"
      @delete="deleteRecording"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { MicVAD } from '@ricky0123/vad-web'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import RecordsList from './RecordsList.vue'
import { AudioProcessor } from './processor'
import { createAudioBlob } from '@/lib/utils'
import { apiClient } from '@/lib/ajax'
import { buildAudioChunk } from './buildAudioChunk'
import type { ISignal } from '@/types'
import { GLOBAL_BUFFER_MAP, allowPlayback } from './replyHandlerStream'

interface Recording {
  id: string
  name: string
  url: string
  date: Date
  duration: number
  blobKey: string
  uploadStatus?: 'uploading' | 'uploaded' | 'failed'
  serverUrl?: string
}

// Configuration
const SILENCE_TIMEOUT_MS = 200 // Time to wait after silence before auto-sending
const SILENCE_UPDATE_INTERVAL = 50 // How often to update the countdown display

const isRecording = ref(false)
const isLoading = ref(false)
const recordings = ref<Recording[]>([])
const sequence = ref(0)
const currentSessionId = ref<string | null>(null)

// New state for auto-send functionality
const isSpeaking = ref(false)
const hasSentForCurrentSpeech = ref(false)
const silenceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const silenceCountdownTimer = ref<ReturnType<typeof setInterval> | null>(null)
const silenceStartTime = ref<number>(0)
const silenceTimeRemaining = ref<number>(0)
const lastSpeechEndTime = ref<number>(0)

let micVad: MicVAD | null = null
let processor: AudioProcessor | null = null

async function startSession () {
  if (currentSessionId.value) {
    return
  }

  const response = await apiClient.post('/api/conversations')
  currentSessionId.value = response.data.sessionId
}

function clearSilenceTimers () {
  if (silenceTimer.value) {
    clearTimeout(silenceTimer.value)
    silenceTimer.value = null
  }
  if (silenceCountdownTimer.value) {
    clearInterval(silenceCountdownTimer.value)
    silenceCountdownTimer.value = null
  }
  silenceTimeRemaining.value = 0
}

function startSilenceTimer () {
  // Don't start a new timer if we've already sent for this speech session
  if (hasSentForCurrentSpeech.value) {
    return
  }

  clearSilenceTimers()
  
  silenceStartTime.value = Date.now()
  silenceTimeRemaining.value = SILENCE_TIMEOUT_MS
  
  // Update countdown display
  silenceCountdownTimer.value = setInterval(() => {
    const elapsed = Date.now() - silenceStartTime.value
    silenceTimeRemaining.value = Math.max(0, SILENCE_TIMEOUT_MS - elapsed)
  }, SILENCE_UPDATE_INTERVAL)
  
  // Set the main timer for auto-send
  silenceTimer.value = setTimeout(() => {
    autoSendRecording()
  }, SILENCE_TIMEOUT_MS)
}

function autoSendRecording () {
  // Only auto-send if we haven't already sent for this speech session
  if (!hasSentForCurrentSpeech.value && isRecording.value) {
    sendRecording()
    hasSentForCurrentSpeech.value = true
  }
  clearSilenceTimers()
}

function manualSendRecording () {
  if (!hasSentForCurrentSpeech.value && isRecording.value) {
    sendRecording()
    hasSentForCurrentSpeech.value = true
  }
  clearSilenceTimers()
}

function sendRecording () {
  const message: ISignal = {
    type: 'stop',
    payload: {
      type: 'stop',
      sessionId: currentSessionId.value!,
      sequence: sequence.value,
      timestamp: Date.now()
    }
  }

  processor!.sendMessage(message)
}

function sendStartSpeakingSignal () {
  const message: ISignal = {
    type: 'start-speaking',
    payload: {
      type: 'start-speaking',
      sessionId: currentSessionId.value!,
      timestamp: Date.now()
    }
  }

  processor!.sendMessage(message)
}

function stopOngoingAudio () {
  GLOBAL_BUFFER_MAP.forEach((value, key) => {
    if (!value.ended) {
      value.buffer.stop()
    }
  })
}

async function startRecording () {
  try {
    isLoading.value = true
    sequence.value = 0
    isSpeaking.value = false
    hasSentForCurrentSpeech.value = false
    clearSilenceTimers()

    await startSession()

    if (!currentSessionId.value) {
      throw new Error('Session ID is not set')
    }

    processor = new AudioProcessor(currentSessionId.value)
    
    await processor.connectWithUpgrade()

    recordings.value = []
    
    micVad = await MicVAD.new({
      model: 'v5',
      // frameSamples: 512, // 512 / 16Khz = 32ms/frame
      redemptionFrames: 50, // 30 * 32ms = 960ms
      minSpeechFrames: 3, // default is 3 but it's false positive quite a lot
      onSpeechRealStart: () => {
        console.log('onSpeechRealStart')
        // User started speaking
        isSpeaking.value = true
        hasSentForCurrentSpeech.value = false // Reset for new speech session
        clearSilenceTimers() // Cancel any pending auto-send
        sendStartSpeakingSignal()
        allowPlayback(false)
        stopOngoingAudio()
      },
      onVADMisfire () {
        console.log('onVADMisfire')
        isSpeaking.value = false
        hasSentForCurrentSpeech.value = false
        allowPlayback(true)
        clearSilenceTimers()
      },
      onSpeechEnd: async (audio: Float32Array) => {
        console.log('onSpeechEnd')
        // user interrupts while AI is speaking
        allowPlayback(true)

        // User stopped speaking
        isSpeaking.value = false
        lastSpeechEndTime.value = Date.now()
        
        sequence.value++

        const audioBlob = createAudioBlob(audio)
        const url = URL.createObjectURL(audioBlob)
        const duration = Math.round(audio.length / 16000)
        const recordingId = uuidv4()
        
        const recording: Recording = {
          id: recordingId,
          name: `Recording ${recordings.value.length + 1}`,
          url,
          date: new Date(),
          duration,
          blobKey: uuidv4(),
          uploadStatus: 'uploading'
        }
        
        recordings.value.push(recording)
        
        // const audioChunk = await buildAudioChunk(currentSessionId.value!, sequence.value, audioBlob)
        // processor!.sendRaw(audioChunk)

        startSilenceTimer()
      },
    })
    
    micVad.start()
    isRecording.value = true
    isLoading.value = false
  } catch (error) {
    console.error('Failed to start recording:', error)
    isLoading.value = false
    sequence.value = 0
  }
}

function stopRecording () {
  clearSilenceTimers()
  
  if (micVad) {
    micVad.pause()
    micVad.destroy()
    micVad = null
  }

  processor!.endSession(currentSessionId.value!, sequence.value)
  processor!.disconnect()

  isRecording.value = false
  isSpeaking.value = false
  hasSentForCurrentSpeech.value = false
  sequence.value = 0

  currentSessionId.value = null
  processor = null
}

function deleteRecording (id: string) {
  const recordingIndex = recordings.value.findIndex(r => r.id === id)
  if (recordingIndex !== -1) {
    const recording = recordings.value[recordingIndex]
    URL.revokeObjectURL(recording.url)
    recordings.value.splice(recordingIndex, 1)
  }
}

onUnmounted(() => {
  clearSilenceTimers()
  
  if (micVad) {
    micVad.pause()
    micVad.destroy()
  }
  
  recordings.value.forEach(recording => {
    URL.revokeObjectURL(recording.url)
  })
})
</script>