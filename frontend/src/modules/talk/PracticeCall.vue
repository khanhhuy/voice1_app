<template>
  <div class="h-full flex flex-col items-center mt-32">
    <div
      v-if="agent"
      class="conversation-container flex flex-col bg-[#FAFAFA] p-12 rounded-lg shadow-sm"
    >
      <div
        class="flex flex-row gap-8 w-[900px]"
      >
        <div class="flex flex-col flex-1">
          <div class="flex flex-row gap-3 bg-white rounded-lg p-6">
            <img 
              :src="agent.avatar"
              class="w-16 h-16 rounded-full"
            >
            <div class="flex flex-col">
              <span class="text-sm text-gray-500 capitalize">{{ agent.name }}</span>
              <span class="text-sm text-gray-700 font-semibold">{{ agent.role }}</span>
              <div class="text-sm text-sky-800 font-light italic mt-1 animate-pulse">
                listening...
                {{ isSpeaking ? 'Speaking...' : '' }}
              </div>
            </div>
          </div>
          <div class="mt-6 pl-6">
            <div class="text-sm text-gray-400">
              Tips, try asking <span class="capitalize">{{ agent.name }}</span> about:
            </div>
            <ul class="text-sm text-gray-400 list-disc list-inside">
              <li
                v-for="tip in agent.tips"
                :key="tip"
              >
                {{ tip }}
              </li>
            </ul>
          </div>
        </div>
        <div class="bg-white flex-1 rounded-lg">
          <div class="text-sm  p-6">
            <span
              v-show="!currentTranscription"
              class="italic text-gray-400"
            >
              Transcription will appear here...
            </span>
            <span
              v-show="currentTranscription"
              class="text-gray-400 text-sm"
            > {{ currentTranscription }} </span>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center relative">
        <div class="mt-18">
          <Button
            v-show="status === 'not_started'"
            class="px-12 cursor-pointer"
            size="sm"
            @click="startSession"
          >
            <i class="ri-phone-fill" />
            <span>Start</span>
          </Button>
          <Button
            v-show="status === 'preparing'"
            class="px-12 text-white"
            size="sm"
          >
            <Loading text="Connecting..." />
          </Button>
          <div
            v-show="status === 'recording'"
            class="flex items-center justify-center gap-3"
          >
            <div class="relative">
              <div
                class="absolute z-10 flex items-center justify-center"
                style="top: 6px; left: 6px;"
              >
                <PulseCircle
                  ref="pulseCircle"
                  :radius="14"
                  :duration="500"
                />
              </div>
              <div
                class="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full z-20 relative"
              >
                <i
                  class="ri-mic-line text-gray-500"
                />
              </div>
            </div>
            <div
              class="rounded-full bg-red-500 hover:bg-red-600 cursor-pointer w-10 h-10 flex items-center justify-center"
              @click="stopSession"
            >
              <i class="ri-phone-fill text-white" />
            </div>
          </div>
        </div>
        <div
          v-if="microphone && micReady"
          class="absolute top-18 right-0 text-xs text-gray-300 w-[150px]"
        >
          <div class="text-right">
            Mic:
            {{ microphone.getDeviceInfo()?.label.replace('Default -', '') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted, useTemplateRef } from 'vue'
import { apiClient } from '@/lib/ajax'
import { MicrophoneService } from './mic'
import { AudioProcessor } from './processor'
import { Button } from '@/components/ui/button'
import { useRoute } from 'vue-router'
import { AGENTS, type IAgent } from './agents'
import { usePageHeader } from '@/modules/header/usePageHeader'
import { buildAudioChunk } from './buildAudioChunk'
import Loading from '@/components/ui/Loading.vue'
import { audioPlayingEvent, replyEvent } from './replyHandlerStream'
import PulseCircle from './PulseCircle.vue'
import { AudioChangeDetector } from '@/services/audioChangeDetector'

const route = useRoute()
const { setTitle } = usePageHeader()!

const currentSessionId = ref<string | null>(null)
const status = ref<'not_started' | 'preparing' | 'recording'>('recording')
const agent: Ref<IAgent | null> = ref(null)
let processor: AudioProcessor | null = null
let microphone: MicrophoneService | null = null
const micReady = ref(false)

let speakingInterval: ReturnType<typeof setInterval> | null = null
let endSpeakingAt: number = 0
const isSpeaking = ref(false)
const currentTranscription = ref('')

let visualizationBuffer: ArrayBuffer[] = []

const pulseCircle = useTemplateRef('pulseCircle')

function testPulse () {
  pulseCircle.value?.createPulse()
}

const audioChangeDetector = new AudioChangeDetector((result) => {
  if (result.isSpeaking) {
    pulseCircle.value?.createPulse()
  }
})


audioPlayingEvent.on((duration) => {
  if (!isSpeaking.value) {
    endSpeakingAt = Date.now()

    if (speakingInterval) {
      clearInterval(speakingInterval)
    }

    speakingInterval = setInterval(() => {
      if (Date.now() > endSpeakingAt) {
        clearInterval(speakingInterval!)
        speakingInterval = null
        isSpeaking.value = false
      }
    }, 200)
  }

  isSpeaking.value = true
  endSpeakingAt += duration * 1000
})


replyEvent.on((reply) => {
  if (reply.type === 'reply_start') {
    currentTranscription.value = reply.text || ''
  }
})

async function handleAudioBuffer (audioBuffer: ArrayBuffer, processor: AudioProcessor | null, sessionId: string | null, sequence: number) {
  // const audioData = await buildAudioChunk(sessionId, sequence, audioBuffer)
  // void processor.sendRaw(audioData)

  if (visualizationBuffer.length > 2) {
    const totalLength = visualizationBuffer.reduce((acc, buffer) => acc + buffer.byteLength, 0)
    const tmp = new Uint8Array(totalLength)
    for (let i = 0; i < visualizationBuffer.length; i++) {
      tmp.set(new Uint8Array(visualizationBuffer[i]), i * visualizationBuffer[i].byteLength)
    }
    audioChangeDetector.processAudioChunk(tmp.buffer)
    visualizationBuffer = []
  } else {
    visualizationBuffer.push(audioBuffer)
  }
}

async function prepareMic () {
  micReady.value = false
  if (microphone) {
    await microphone.stopRecording()
  }

  microphone = new MicrophoneService(async (audioBuffer, sequence) => {
    // if (!processor?.isConnected || !currentSessionId.value) {
    //   return
    // }

    void handleAudioBuffer(audioBuffer, processor, currentSessionId.value, sequence)
  })

  await microphone.startRecording()
  micReady.value = true
}

async function startSession () {
  status.value = 'preparing'

  if (currentSessionId.value) {
    return
  }

  const response = await apiClient.post('/api/conversations')
  currentSessionId.value = response.data.sessionId

  if (!currentSessionId.value) {
    throw new Error('Failed to start session')
  }

  processor = new AudioProcessor(currentSessionId.value)
  await processor.connectWithUpgrade()

  status.value = 'recording'
}

async function stopSession () {
  try {
    if (microphone) {
      await microphone.stopRecording()
    // microphone.playRecording()
    }

    if (processor) {
      processor.sendMessage({
        type: 'end-convo',
        payload: {
          type: 'end-convo',
          sessionId: currentSessionId.value!,
          timestamp: Date.now()
        }
      })
      processor.disconnect()
    }

    currentSessionId.value = null
  } catch (error) {
    console.error('Failed to stop session:', error)
  } finally {
    status.value = 'not_started'
  }
}

onMounted(async () => {
  const a = AGENTS.find(a => a.name === route.params.agent)
  if (!a) { 
    console.error('Agent not found')
    return
  }

  agent.value = a
  setTitle(`Practice with ${agent.value?.name}`)

  await prepareMic()
})


</script>
