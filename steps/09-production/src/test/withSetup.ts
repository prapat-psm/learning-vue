import { createApp, type App, type Plugin } from 'vue'

/**
 * Run a composable inside a real component so lifecycle hooks (onMounted...) fire.
 * React equivalent: renderHook() from @testing-library/react.
 * Step 07: pass plugins, e.g. [[VueQueryPlugin, { queryClient }]] ≈ renderHook's `wrapper`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PluginEntry = Plugin | [Plugin, ...any[]]

export function withSetup<T>(composable: () => T, plugins: PluginEntry[] = []): [T, App] {
  let result!: T
  const app = createApp({
    setup() {
      result = composable()
      return () => null
    },
  })
  for (const p of plugins) {
    if (Array.isArray(p)) app.use(p[0], ...p.slice(1))
    else app.use(p)
  }
  app.mount(document.createElement('div'))
  return [result, app]
}
