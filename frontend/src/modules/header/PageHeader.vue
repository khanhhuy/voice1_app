<template>
  <div class="page-header px-8 pt-4 text-sm flex flex-row items-center gap-3">
    <SidebarTrigger class="cursor-pointer w-4 h-4 text-muted-foreground-2" />
    <div class="mb-0.5 text-muted-foreground-2">|</div>
    <div class="">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePageHeader } from './usePageHeader'

const { title } = usePageHeader()!
</script>