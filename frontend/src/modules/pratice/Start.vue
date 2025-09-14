<template>
  <div class="flex flex-col items-center gap-4 h-full">
    <div class="mb-5 mt-20">
      Let's have your first conversation!
    </div>
    <div class="flex flex-row items-center justify-center gap-12">
      <div
        v-for="agent in agents"
        :key="agent.name"
        class="agent-card flex flex-col rounded-lg overflow-hidden h-[527px] w-[330px] shadow-md"
      >
        <div
          class="header h-[223px] py-8 px-5"
          :style="{ backgroundColor: agent.bg }"
        >
          <div class="flex flex-row items-center space-between gap-3 text-sm">
            <img
              :src="agent.avatar"
              class="w-16 h-16 ml-4 rounded-full"
            >
            <div class="flex flex-col items-start justify-center">
              <div
                :style="{ color: agent.primaryText }"
                class=""
              >
                {{ agent.name }}
              </div>
              <div
                :style="{ color: agent.secondaryText }"
                class="font-semibold"
              >
                {{ agent.title }}
              </div>
            </div>
          </div>

          <div
            :style="{ color: agent.secondaryText }"
            class="text-sm mt-5 px-4 italic leading-5 "
          >
            "{{ agent.intro }}"
          </div>
        </div>
        <div class="px-6 flex-1">
          <div class="text-gray-600 text-sm font-semibold pt-6 pb-3">
            Common challenges {{ agent.name }} can help
          </div>
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <div
              v-for="skill in agent.skills"
              :key="skill"
              class="rounded-sm px-3 py-1 text-xs whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {{ skill }}
            </div>
          </div>
        </div>
        <div class="h-[120px] flex items-center flex-col justify-start">
          <Button
            size="sm"
            class="mt-2 cursor-pointer"
            @click="navigateTo(agent.url)"
          >
            Start Practice
          </Button>
          <div class="text-gray-400 mt-6 text-xs">
            Session length: ~10 minutes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()

const agents = ref([
  {
    name: 'Mae',
    title: 'User-discovery Coach',
    intro: 'Hi there! I\'m Mae, let\'s work on your user interview skills together. I\'ll simulate a realistic user and give you feedback on your approach',
    avatar: 'https://voice1-production.sgp1.cdn.digitaloceanspaces.com/assets/mae.png',
    bg: '#FFEFE7',
    primaryText: '#4B2310',
    secondaryText: '#684534',
    pillBg: '#FFF1EA',
    pillText: '#BE5C31',
    skills: ['Ice-breaking', 'Managing scope', 'Agenda briefing', 'Probing questions'],
    url: '/practice/mae',
  },
  {
    name: 'Kim',
    title: 'Customer-support Coach',
    intro: 'Hi there! I\'m Kim, I\'ll simulate a tough* user feedback session and I\'ll guide you some tips on how to tackle it',
    avatar: 'https://voice1-production.sgp1.cdn.digitaloceanspaces.com/assets/kim.png',
    bg: '#F6F4F9',
    primaryText: '#15154C',
    secondaryText: '#3C3C67',
    pillBg: '#F7F0FF',
    pillText: '#3C3C67',
    skills: ['Handling difficult customers', 'Conflict resolution', 'Damage control', 'Conflict resolution'],
    url: '/practice/kim',
  },
])

function navigateTo (url: string) {
  router.push(url)
}

</script>