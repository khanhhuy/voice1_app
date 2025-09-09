<template>
  <div class="flex flex-col gap-4  h-full p-8">
    <div class="flex flex-row gap-4">
      <Button
        class="cursor-pointer"
        :disabled="status === 'recording'"
        @click="startSession"
      >
        Start Session
      </Button>
      <Button
        variant="outline"
        class="cursor-pointer"
        :disabled="status !== 'recording'"
        @click="stopSession"
      >
        Stop Session
      </Button>
    </div>
    <div>
      <span class="text-sm text-gray-500">Status: {{ status }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient } from '@/lib/ajax'
import { MicrophoneService } from './mic'
import { AudioProcessor } from './processor'
import { Button } from '@/components/ui/button'

const currentSessionId = ref<string | null>(null)
const status = ref<'not_started' | 'recording' | 'stopped'>('not_started')

let processor: AudioProcessor | null = null
let microphone: MicrophoneService | null = null

async function startSession () {
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

  microphone = new MicrophoneService(currentSessionId.value, 0)
  await microphone.startRecording(processor)

  status.value = 'recording'
}

function stopSession () {
  if (microphone) {
    microphone.stopRecording()
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
  status.value = 'stopped'
}


</script>
