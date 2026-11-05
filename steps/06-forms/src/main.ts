import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createAppRouter } from './router'

// Pinia first: router guards call stores, so the store system must exist before navigation
createApp(App).use(createPinia()).use(createAppRouter()).mount('#app')
