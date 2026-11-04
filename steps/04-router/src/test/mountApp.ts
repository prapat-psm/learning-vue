import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import { createAppRouter } from '@/router'

/**
 * Mount the whole app at a URL with a real router.
 * createMemoryHistory = router without the browser URL bar (like next-router-mock).
 */
export async function mountApp(url = '/') {
  const router = createAppRouter(createMemoryHistory())
  await router.push(url)
  await router.isReady() // wait for guards + lazy chunks
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}
