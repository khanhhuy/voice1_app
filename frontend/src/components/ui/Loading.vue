<template>
  <div class="inline-flex items-center gap-1">
    <div class="animate-spin">
      <i class="ri-loader-line" />
    </div>
    <span
      v-if="text"
      class="text-xs"
    >{{ text }}</span>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  text?: string 
}>(), {
  text: '',
})
</script>