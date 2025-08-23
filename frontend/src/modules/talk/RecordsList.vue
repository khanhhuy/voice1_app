<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
    <h2 class="text-xl font-semibold mb-4">
      Saved Recordings
    </h2>
    
    <div
      v-if="recordings.length === 0"
      class="text-gray-500 text-center py-8"
    >
      No recordings yet. Start recording to create your first audio file.
    </div>
    
    <div
      v-else
      class="space-y-4 grid grid-cols-2 gap-4"
    >
      <div 
        v-for="recording in recordings" 
        :key="recording.id"
        class="border dark:border-gray-600 rounded-lg p-4 flex justify-between"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3>
              {{ recording.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ formatDate(recording.date) }} • {{ formatDuration(recording.duration) }}
            </p>
          </div>
        </div>
        
        <audio
          :src="recording.url"
          controls
          class="w-[150px]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

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

defineProps<{
  recordings: Recording[]
}>()

defineEmits<{
  delete: [id: string]
}>()

function formatDuration (seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function formatDate (date: Date): string {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>