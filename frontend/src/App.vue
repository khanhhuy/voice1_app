<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <PageHeader />
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { useProvideAccount } from '@/modules/account/useAccount'
import './styles/index.css'
import 'remixicon/fonts/remixicon.css'
import { onMounted } from 'vue'
import AppSidebar from '@/modules/sidebar/AppSidebar.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import PageHeader from '@/modules/header/PageHeader.vue'
import { useProvidePageHeader } from './modules/header/usePageHeader'

window.voice1 ||= {}

const { checkLogin } = useProvideAccount()
useProvidePageHeader()

onMounted(() => {
  checkLogin()
})

</script>