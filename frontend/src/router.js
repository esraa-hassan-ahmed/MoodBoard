// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import SharedPhotos from './components/SharedPhotos.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/shared', name: 'SharedPhotos', component: SharedPhotos },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
