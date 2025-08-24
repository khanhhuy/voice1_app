<template>
  <div class="w-full mx-auto px-8 py-4">
    <div class="mb-8">
      <div class="flex justify-between items-center mb-0">
        <h1 class="text-base font-semibold text-gray-800">
          Practice Scenarios
        </h1>
      </div>
      <p class="text-gray-600 text-sm">
        Select a scenario that matches your upcoming customer call. Each simulation provides
        realistic practice with AI feedback.
      </p>
    </div>

    <!-- Main Content -->
    <div>
      <section 
        v-for="category in categories" 
        :key="category.id" 
        class="mb-14"
      >
        <div class="category-header">
          <h2 class="font-semibold text-lg flex items-center">
            <i :class="[category.icon, category.iconColor, 'mr-1']" /> {{ category.title }}
          </h2>
          <p class="text-gray-600 text-sm mt-1">
            {{ category.description }}
          </p>
        </div>

        <div 
          :class="[
            'grid gap-6 mt-4 grid-cols-3'
          ]"
        >
          <div 
            v-for="scenario in category.scenarios" 
            :key="scenario.id" 
            class="scenario-card bg-background-secondary flex flex-col rounded-lg p-4 border border-border"
          >
            <div
              class="flex-1"
              :class="{ 'flex justify-between items-start mb-4': scenario.priority, 'mb-4': !scenario.priority }"
            >
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-gray-800">
                    {{ scenario.title }}
                  </h3>
                  <div
                    v-tooltip="{
                      content: difficultyTooltip(scenario.difficulty),
                    }"
                    class="flex items-center gap-1 hover:text-gray-600 cursor-pointer text-gray-400"
                  >
                    <div
                      class="rounded-full w-2 h-2"
                      :class="{
                        'bg-[#8EC8F6]': scenario.difficulty === 'gentle',
                        'bg-[#F5AE73]': scenario.difficulty === 'standard',
                        'bg-[#e25356]': scenario.difficulty === 'challenging'
                      }" 
                    />
                    <span class="text-xs">
                      {{ scenario.difficulty }}
                    </span>
                  </div>
                </div>
                <p class="text-gray-600 text-sm mt-2 h-20">
                  {{ scenario.description }}
                </p>
                <!-- <div class="text-sm text-gray-600 mt-2">
                  <div>
                    • Skills: active listening, follow-up questions
                  </div>
                  <div>
                    • 
                    <span class="text-xs text-gray-500"><i class="ri-time-line mr-1" /> {{ scenario.duration }}</span>
                  </div>
                </div> -->
                <div class="flex items-center mt-2">
                  <div>
                    <img
                      :src="`${scenario.person.avatar}?username=${scenario.person.name}`"
                      :alt="`${scenario.person.name}`"
                      class="w-8 h-8 rounded-full"
                    >
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-700">
                      {{ scenario.person.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ scenario.person.role }}
                    </p>
                  </div>
                </div>
              </div>
              <!-- <span 
                v-if="scenario.priority" 
                :class="['text-xs px-2 py-1 rounded-full', scenario.priority.bg, scenario.priority.textColor]"
              >
                {{ scenario.priority.text }}
              </span> -->
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500"><i class="ri-time-line mr-1" /> {{ scenario.duration }}</span>
              <Button size="xs">
                Practice
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageHeader } from '@/modules/header/usePageHeader'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const { setTitle } = usePageHeader()!
setTitle('Product Team')

function difficultyTooltip (difficulty: string) {
  switch (difficulty) {
    case 'gentle':
      return 'Patient customers with clear problems. Great for practicing active listening and follow-up questions without pressure'
    case 'standard':
      return 'Real-world scenarios with moderate complexity. Customers may have multiple concerns but are generally reasonable to work with'
    case 'challenging':
      return 'Frustrated customers, technical edge cases, or competing priorities. Tests your ability to stay calm and find creative solutions'
  }
  return ''
}

const categories = ref([
  {
    id: 'user-research',
    title: 'User Research & Discovery',
    icon: 'ri-message-3-line',
    iconColor: 'text-[#29A383]',
    description: 'Practice conducting user interviews and discovering insights',
    scenarios: [
      {
        id: 3,
        title: 'First-Time User Interview',
        person: {
          name: 'Jessica Lee',
          role: 'Marketing Manager, GrowthCo',
          avatar: 'https://avatar.iran.liara.run/public/girl',
          icon: 'ri-emotion-line',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        },
        description: 'New customer completed onboarding 2 weeks ago. You want to understand their initial experience and current workflow.',
        duration: '10-15 min practice',
        priority: null,
        difficulty: 'gentle',
        skills: ['active listening', 'follow-up questions']
      },
      {
        id: 4,
        title: 'Struggling User Check-in',
        person: {
          name: 'David Wilson',
          role: 'Operations Director, EnterpriseCo',
          avatar: 'https://avatar.iran.liara.run/public/boy',
          icon: 'ri-emotion-unhappy-line',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        },
        description: 'Customer signed up 1 month ago but has low usage. You need to identify barriers and friction points.',
        duration: '15-20 min practice',
        priority: null,
        difficulty: 'gentle',
        skills: ['problem identification', 'empathy']
      },
      {
        id: 5,
        title: 'Use Case Discovery',
        person: {
          name: 'Alex Rodriguez',
          role: 'Creative Director, DesignStudio',
          avatar: 'https://avatar.iran.liara.run/public/boy',
          icon: 'ri-lightbulb-line',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        },
        description: 'Customer is using your product in an unexpected way. Learn about their creative workflow and potential new features.',
        duration: '15-20 min practice',
        priority: null,
        difficulty: 'standard',
        skills: ['pain point discovery', 'use case analysis']
      }
    ]
  },
  {
    id: 'feature-development',
    title: 'Feature Development',
    icon: 'ri-settings-3-line',
    iconColor: 'text-[#8E4EC6]',
    description: 'Practice gathering feedback and recruiting beta testers',
    scenarios: [
      {
        id: 6,
        title: 'Feature Feedback Session',
        person: {
          name: 'Michelle Zhang',
          role: 'Data Analyst, AnalyticsPro',
          avatar: 'https://avatar.iran.liara.run/public/girl',
          icon: 'ri-bar-chart-2-line',
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600'
        },
        description: 'Customer has been testing your new analytics dashboard for 3 weeks. Gather detailed feedback on usability and missing functionality.',
        duration: '15-20 min practice',
        priority: {
          text: 'Feedback',
          bg: 'bg-blue-100',
          textColor: 'text-blue-800'
        },
        difficulty: 'gentle',
        skills: ['active listening', 'follow-up questions']
      },
      {
        id: 7,
        title: 'Beta Recruitment Call',
        person: {
          name: 'Robert Kim',
          role: 'Product Lead, SaaSEnterprise',
          avatar: 'https://avatar.iran.liara.run/public/boy',
          icon: 'ri-flask-line',
          iconBg: 'bg-pink-100',
          iconColor: 'text-pink-600'
        },
        description: 'Convince a key customer to join your early access program for upcoming AI features. They\'re interested but concerned about stability.',
        duration: '15-20 min practice',
        priority: {
          text: 'Recruitment',
          bg: 'bg-green-100',
          textColor: 'text-green-800'
        },
        difficulty: 'standard',
        skills: ['value proposition', 'scope definition']
      }
    ]
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving & Investigation',
    icon: 'ri-search-line',
    iconColor: 'text-[#3E63DD]',
    description: 'Practice handling complex technical issues and edge cases',
    scenarios: [
      {
        id: 1,
        title: 'Support Escalation Call',
        person: {
          name: 'Sarah Chen',
          role: 'Head of Operations, TechCorp',
          avatar: 'https://avatar.iran.liara.run/public/girl',
          icon: 'ri-customer-service-2-line',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        },
        description: 'Customer support couldn\'t resolve a complex technical issue. Customer is frustrated and you need to dig deeper into their setup to find a solution.',
        duration: '15-20 min practice',
        priority: {
          text: 'High Priority',
          bg: 'bg-red-100',
          textColor: 'text-red-800'
        },
        difficulty: 'challenging',
        skills: ['empathy', 'conflict resolution']
      },
      {
        id: 2,
        title: 'Edge Case Investigation',
        person: {
          name: 'Marcus Johnson',
          role: 'CTO, InnovateStartup',
          avatar: 'https://avatar.iran.liara.run/public/boy',
          icon: 'ri-bug-line',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        },
        description: 'Customer reports strange behavior that only happens in their specific configuration. You need to understand their unique setup and find the root cause.',
        duration: '15-20 min practice',
        priority: {
          text: 'Technical',
          bg: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        },
        difficulty: 'standard',
        skills: ['technical translation', 'problem identification']
      }
    ]
  }
])
</script>