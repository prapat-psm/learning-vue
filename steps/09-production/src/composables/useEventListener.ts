import { onMounted, onUnmounted } from 'vue'

/**
 * Add a DOM listener and clean it up automatically.
 * React equivalent:
 *   useEffect(() => { el.addEventListener(e, fn); return () => el.removeEventListener(e, fn) }, [])
 * In Vue the setup/cleanup pair is onMounted / onUnmounted.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
) {
  onMounted(() => target.addEventListener(event, handler))
  onUnmounted(() => target.removeEventListener(event, handler))
}
