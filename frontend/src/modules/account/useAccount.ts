import { createInjectionState } from '@vueuse/core'
import type { IUser } from '@shared/shared_types'
import { computed, ref, type Ref } from 'vue'
import { apiClient } from '@/lib/ajax'

const [useProvideAccount, useAccount] = createInjectionState(() => {
  const user: Ref<IUser | null> = ref(null)
  const isLoggedIn = computed(() => user.value !== null)
  const isLoggingIn = ref(false)

  function checkLogin () {
    // Get token from local storage
    // if there is a token, then call handleLogin
    // if there is no token, then call handleLogout

    const token = localStorage.getItem('voice1_token')
    if (token) {
      handleLogin(token)
    } else {
      handleLogout()
    }
  }

  async function handleLogin (token?: string) {
    isLoggingIn.value = true
    const urlToken = token || new URLSearchParams(window.location.search).get('token')
    
    if (!urlToken) {
      console.error('No token found in URL')
      isLoggingIn.value = false
      return false
    }

    // Store token in window object and localStorage
    if (!window.voice1) window.voice1 = {}
    window.voice1.token = urlToken
    localStorage.setItem('voice1_token', urlToken)

    try {
      // Fetch user data
      const response = await apiClient.get('/api/users/me')
      user.value = response.data
      return true
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      handleLogout()
      return false
    } finally {
      isLoggingIn.value = false
    }
  }

  function handleLogout () {
    // Remove token from window object
    if (window.voice1) {
      delete window.voice1.token
    }
    
    // Remove token from localStorage
    localStorage.removeItem('voice1_token')
    
    // Clear user data
    user.value = null
    
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return {
    user,
    isLoggedIn,
    handleLogin,
    handleLogout,
    checkLogin,
    isLoggingIn,
  }
})

export { useProvideAccount, useAccount }