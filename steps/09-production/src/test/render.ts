import { render, type RenderOptions } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '@/App.vue'
import { createAppRouter } from '@/router'
import { createTestQueryClient } from './mountApp'
import { appPlugins } from '@/plugins'

/**
 * Testing Library version of mountApp: "custom render with providers".
 * Exactly the pattern from React docs: render(ui, { wrapper: AllProviders }).
 * Returns `user` (user-event) so every test types and clicks like a real user.
 */
export async function renderApp(url = '/', options: RenderOptions<typeof App> = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const queryClient = createTestQueryClient()
  const router = createAppRouter(createMemoryHistory())
  await router.push(url)
  await router.isReady()

  const user = userEvent.setup()
  const utils = render(App, {
    ...options,
    global: { plugins: [...appPlugins(), pinia, router, [VueQueryPlugin, { queryClient }]] },
  })
  return { ...utils, user, router, queryClient }
}
