<template>
  <div class="max-w-md mx-auto p-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Account Settings
      </h1>

      <Loading
        v-if="isLoggingIn"
        text="Loading your account..."
      />

      <div
        v-show="isLoggedIn && !isLoggingIn"
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <div class="text-gray-900 dark:text-white font-medium">
            {{ user?.display_name || 'Not set' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div class="text-gray-900 dark:text-white font-medium">
            {{ user?.email || 'Not set' }}
          </div>
        </div>
        
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            class="w-full cursor-pointer"
            @click="handleLogout"
          >
            <i class="ri-logout-box-r-line mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccount } from '@/modules/account/useAccount'
import { Button } from '@/components/ui/button'
import Loading from '@/components/ui/Loading.vue'
import { onMounted, ref } from 'vue'

const { isLoggedIn, user, handleLogin, handleLogout: logout, isLoggingIn } = useAccount()!

onMounted(async () => {
  // Check if there's a token in the URL (redirect from backend)
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  if (token) {
    // Handle login with token from URL
    const success = await handleLogin(token)
    if (success) {
      // Remove token from URL after successful login
      window.history.replaceState({}, '', '/account')
    }
  }
})

const handleLogout = () => {
  logout()
}
</script>