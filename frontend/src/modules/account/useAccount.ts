import { createInjectionState } from '@vueuse/core'
import type { IUser } from '@shared/shared_types'
import { computed, ref, type Ref } from 'vue'
import { apiClient } from '@/lib/ajax'

const [useProvideAccount, useAccount] = createInjectionState(() => {
  const user: Ref<IUser | null> = ref(null)
  const isLoggedIn = computed(() => user.value !== null)

  function handleLogin () {
    // TODO: backend will redirect to /account?token=...
    // store the token in the window object window.voice1.token
    // store the token in the local storage
    // 
    // use apiClient to get ('/api/users/me), this will return an IUser object
    // store it
  }

  return {
    user,
    isLoggedIn,
  }
})

export { useProvideAccount, useAccount }