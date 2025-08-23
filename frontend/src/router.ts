import { createWebHistory, createRouter } from 'vue-router'
import Login from '@/modules/account/Login.vue'
import Account from '@/modules/account/Account.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/account', component: Account },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router }