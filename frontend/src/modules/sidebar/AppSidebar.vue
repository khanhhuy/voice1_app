<template>
  <Sidebar variant="inset" collapsible="icon">
    <SidebarHeader class="flex flex-row items-center gap-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild :is-active="isActive('/')">
            <RouterLink to="/">
              <Logo :width="24" :height="24" class="rounded"/>
              <span class="font-medium">Voice 1</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>
          Practice
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
              <SidebarMenuItem v-for="item in practiceItems" :key="item.title">
                <SidebarMenuButton asChild :is-active="isActive(item.url)">
                  <RouterLink :to="item.url">
                    <component :is="item.icon" />
                    <span>{{item.title}}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>
          Review
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild :is-active="isActive('/sessions')">
                <RouterLink to="/sessions">
                  <History />
                  <span>Past Sessions</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild :is-active="isActive('/account')">
            <RouterLink to="/account">
              <User />
              <span>My Account</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import { MicVocal, LifeBuoy, History, User } from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Logo from "@/components/ui/Logo.vue"
import { useRoute } from "vue-router"

function isActive(path: string) {
  return useRoute().path === path
}

// Menu items.
const practiceItems = [
  {
    title: "Product Team Scenarios",
    url: "/practice/product",
    icon: MicVocal,
  },
  {
    title: "Customer Support Scenarios",
    url: "/practice/customer-support",
    icon: LifeBuoy,
  },
];
</script>
