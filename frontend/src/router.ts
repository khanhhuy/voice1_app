import { createWebHistory, createRouter } from 'vue-router'
import Login from '@/modules/account/Login.vue'
import Account from '@/modules/account/Account.vue'
import ProductScenarios from '@/modules/pratice/ProductScenarios.vue'
import CustomerSupportScenarios from '@/modules/pratice/CustomerSupportScenarios.vue'
import PracticeCall from '@/modules/talk/PracticeCall.vue'
import Start from '@/modules/pratice/Start.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/account', component: Account },
  { path: '/practice/start', component: Start },
  { path: '/practice/:agent', component: PracticeCall },
  { path: '/practice/product', component: ProductScenarios },
  { path: '/practice/customer-support', component: CustomerSupportScenarios },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router }