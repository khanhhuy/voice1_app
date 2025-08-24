import { createApp } from 'vue'
import App from '@/App.vue'
import { router } from '@/router'
import FloatingVue from 'floating-vue'

const app = createApp(App)
app.use(FloatingVue)
app.use(router)
app.mount('#app')
