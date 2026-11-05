import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createAppRouter } from './router'
import { createAppQueryClient } from './api/queryClient'

// No real backend in this course: start the MSW mock API unless VITE_API_URL points to one.
// Dynamic import → MSW is not in the bundle when you use a real API.
async function enableMocking() {
  if (import.meta.env.VITE_API_URL) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

enableMocking().then(() => {
  createApp(App)
    .use(createPinia())
    // ≈ <QueryClientProvider client={queryClient}> around your React app
    .use(VueQueryPlugin, { queryClient: createAppQueryClient() })
    .use(createAppRouter())
    .mount('#app')
})
