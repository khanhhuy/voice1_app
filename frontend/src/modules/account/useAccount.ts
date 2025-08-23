import { createInjectionState } from '@vueuse/core'
import type { IUser } from '@shared/shared_types'
import { ref, type Ref } from 'vue'

const [useProvideAccount, useAccount] = createInjectionState(() => {
  const user: Ref<IUser | null> = ref(null)

  return {
    user,
  }
})

export { useProvideAccount, useAccount }