import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const app = createApp(App)
app.use(router)
app.provide('socket', socket)
app.mount('#app')