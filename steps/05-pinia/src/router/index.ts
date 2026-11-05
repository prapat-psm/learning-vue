import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'
import { routes } from './routes'

// Typed route meta: router.currentRoute.value.meta.title is a string
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

// Factory so tests can pass createMemoryHistory() (no real URL bar in jsdom)
export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior: () => ({ top: 0 }),
  })

  // Global guard ≈ middleware.ts, but client-side. Return false or a route to block/redirect.
  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · Task Board` : 'Task Board'
  })

  return router
}
