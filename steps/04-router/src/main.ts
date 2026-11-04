import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'

// app.use(router) ≈ wrapping the app in a provider. Gives <RouterView>, <RouterLink>, useRoute()
createApp(App).use(createAppRouter()).mount('#app')
