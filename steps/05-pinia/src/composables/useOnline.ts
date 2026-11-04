import { ref } from 'vue'
import { useEventListener } from './useEventListener'

/** Composables compose: this one is built on useEventListener. */
export function useOnline() {
  const isOnline = ref(navigator.onLine)
  useEventListener(window, 'online', () => (isOnline.value = true))
  useEventListener(window, 'offline', () => (isOnline.value = false))
  return isOnline
}
