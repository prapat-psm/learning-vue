import { createApp, type App } from 'vue'

/**
 * Run a composable inside a real component so lifecycle hooks (onMounted...) fire.
 * React equivalent: renderHook() from @testing-library/react.
 */
export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T
  const app = createApp({
    setup() {
      result = composable()
      return () => null
    },
  })
  app.mount(document.createElement('div'))
  return [result, app]
}
