import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createAppRouter } from './router'
import { createAppQueryClient } from './api/queryClient'
import { appPlugins } from './plugins'
import { config } from './config' // importing it validates the env vars (throws early if wrong)

// No real backend in this course: start the MSW mock API unless VITE_API_URL points to one.
// Dynamic import → the MSW chunk is only downloaded when it is used.
async function enableMocking() {
  if (!config.useMockApi) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

enableMocking().then(() => {
  const app = createApp(App)
  // errorHandling first, so errors in other plugins' setup are reported too
  for (const plugin of appPlugins()) app.use(plugin)
  app
    .use(createPinia())
    .use(VueQueryPlugin, { queryClient: createAppQueryClient() })
    .use(createAppRouter())
    .mount('#app')
})
