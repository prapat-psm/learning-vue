import type { Plugin } from 'vue'
import { logger } from '@/lib/logger'

/**
 * Global safety net. Two kinds of errors exist:
 * 1. Errors inside Vue (render, setup, lifecycle hooks, event handlers, watchers)
 *    → app.config.errorHandler. Only reached if no <ErrorBoundary> stopped them.
 * 2. Errors outside Vue (a forgotten await, setTimeout) → window 'unhandledrejection' / 'error'.
 * React has no app-wide handler; you combine an Error Boundary at the root + window listeners.
 */
let listening = false // add the window listener once, even if several apps are created (tests)

export const errorHandling: Plugin = {
  install(app) {
    app.config.errorHandler = (error, instance, info) => {
      logger.reportError(error, { source: 'vue', info, component: instance?.$options.name })
    }
    if (!listening && typeof window !== 'undefined') {
      listening = true
      window.addEventListener('unhandledrejection', (event) =>
        logger.reportError(event.reason, { source: 'unhandledrejection' }),
      )
    }
  },
}
