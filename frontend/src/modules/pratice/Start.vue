<template>
  <div class="flex flex-col items-center gap-4 h-full">
    <div class="mb-5 mt-20">
      Let's have your first conversation!
    </div>
    <div class="flex flex-col items-center justify-center align-middle rounded-lg overflow-hidden">
      <div
        v-for="agent in agents"
        :key="agent.name"
        class="card flex flex-col justify-center items-center w-[600px] h-[350px] gap-3 cursor-pointer transition-colors duration-300 ease-in-out"
        :style="{
          backgroundColor: agent.hover ? agent.hoverBg : agent.bg,
          color: agent.hover ? agent.hoverText : agent.text,
        }"
        @click="navigateTo(agent.url)"
        @mouseenter="handleHover(agent)"
        @mouseleave="handleLeave(agent)"
      >
        <div class="flex flex-row items-center justify-center gap-3">
          <div class="flex flex-row items-center justify-center gap-2">
            <i
              class="ri-phone-fill text-4xl"
            />
            <div
              class="text-4xl"
            >
              {{ agent.name }}
            </div>
            <img
              :src="agent.avatar"
              class="w-16 h-16 ml-4 rounded-full"
            >
          </div>
        </div>
        <div
          class="w-[380px] mt-3 text-center text-sm"
        >
          {{ agent.desc }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const agents = ref([
  {
    name: 'Mae',
    avatar: 'https://avatar.iran.liara.run/public/98',
    hover: false,
    bg: '#f7745026',
    hoverBg: '#ff7955',
    text: '#7f2c12',
    hoverText: '#ffffff',
    desc: 'Mae is a specialist in user discovery and research conversations. She\'ll help you prepare for your next user interviews and practice asking the right questions to uncover valuable customer insights',
    url: '/practice/mae',
  },
  {
    name: 'Kim',
    avatar: 'https://avatar.iran.liara.run/public/5',
    hover: false,
    bg: '#f9f2ff',
    hoverBg: '#4b54a1',
    text: '#1c2139',
    hoverText: '#ffffff',
    desc: 'Kim excels at navigating difficult customer conversations. He\'ll help you prepare for challenging discussions like delivering bad news, handling upset customers, and saying no while maintaining strong relationships.',
    url: '/practice/kim',
  },
])

function navigateTo (url: string) {
  router.push(url)
}

function handleHover (agent: any) {
  agent.hover = true
}

function handleLeave (agent: any) {
  agent.hover = false
}

</script>