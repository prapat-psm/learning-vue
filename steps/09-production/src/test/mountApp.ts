import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import App from '@/App.vue'
import { createAppRouter } from '@/router'
import { appPlugins } from '@/plugins'

/** A fresh cache per test, no retries (a failing request should fail the test right away). */
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

/**
 * Mount the whole app at a URL with real Pinia, router and QueryClient.
 * The API is MSW (src/test/setup.ts), so this is a real integration test.
 */
export async function mountApp(url = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const queryClient = createTestQueryClient()
  const router = createAppRouter(createMemoryHistory())
  await router.push(url)
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [...appPlugins(), pinia, router, [VueQueryPlugin, { queryClient }]] },
    attachTo: document.body,
  })
  await flushPromises()
  return { wrapper, router, queryClient }
}
