<template>
  <img src="/logo-dark.svg" alt="Logo Voice1" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
const props = defineProps<{
  width?: number
  height?: number
}>()
</script>
