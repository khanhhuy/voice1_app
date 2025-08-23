<template>
  <div class="inline-flex items-center gap-1 text-muted-foreground">
    <div class="animate-spin">
      <i class="ri-loader-line" />
    </div>
    <span class="text-xs text-muted-foreground" v-if="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  text?: string 
}>(), {
  text: '',
})
</script>