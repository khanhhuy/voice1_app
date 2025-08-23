<template>
  <div class="w-full h-full">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useProvideAccount } from '@/modules/account/useAccount'
import './styles/index.css'
import 'remixicon/fonts/remixicon.css'

window.voice1 ||= {}

useProvideAccount()

</script>