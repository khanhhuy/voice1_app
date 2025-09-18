<template>
  <div
    ref="container"
    class="relative"
    :style="{ width: `${radius * 2}px`, height: `${radius * 2}px` }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  radius?: number
  color?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  radius: 10,
  color: '#9ca3af',
  duration: 400
})

const container = ref<HTMLElement>()

const createPulse = () => {
  if (!container.value) return

  const pulseElement = document.createElement('div')

  // Set styles directly via DOM API
  pulseElement.style.position = 'absolute'
  pulseElement.style.width = `${props.radius * 2}px`
  pulseElement.style.height = `${props.radius * 2}px`
  pulseElement.style.borderRadius = '50%'
  pulseElement.style.backgroundColor = props.color

  // scale 1 starts from the edge of the circle
  // scale 0 starts from the center of the circle
  pulseElement.style.transform = 'scale(1)'
  pulseElement.style.opacity = '1'
  pulseElement.style.pointerEvents = 'none'

  // Add to container immediately
  container.value.appendChild(pulseElement)

  // Start animation using Web Animations API for maximum performance
  const animation = pulseElement.animate([
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(2)', opacity: '0' }
  ], {
    duration: props.duration,
    easing: 'ease-out',
    fill: 'forwards'
  })

  // Remove element when animation completes
  animation.addEventListener('finish', () => {
    if (container.value?.contains(pulseElement)) {
      container.value.removeChild(pulseElement)
    }
  })
}

defineExpose({
  createPulse
})
</script>

<style scoped>
</style>