import { createInjectionState } from '@vueuse/core'
import { ref } from 'vue'

const [useProvidePageHeader, usePageHeader] = createInjectionState(() => {
  const title = ref('')

  function setTitle (newTitle: string) {
    title.value = newTitle
  }

  return {
    title,
    setTitle,
  }
})

export { useProvidePageHeader, usePageHeader }