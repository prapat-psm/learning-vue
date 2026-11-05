import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { createAppRouter } from '@/router'

/**
 * Mount the whole app at a URL with a real Pinia and router.
 * createMemoryHistory = router without the browser URL bar (like next-router-mock).
 */
export async function mountApp(url = '/') {
  // Real Pinia (not the testing one): integration tests run real actions.
  // setActivePinia so route guards can call stores before the app mounts.
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createAppRouter(createMemoryHistory())
  await router.push(url)
  await router.isReady() // wait for guards + lazy chunks
  const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}
