import type { Plugin } from 'vue'
import { createConfirm } from './confirm'
import { createToast } from './toast'
import { errorHandling } from './errorHandling'

/** Every app-level plugin of step 09, so main.ts and the test helpers install the same set. */
export function appPlugins(): Plugin[] {
  return [errorHandling, createToast(), createConfirm()]
}
