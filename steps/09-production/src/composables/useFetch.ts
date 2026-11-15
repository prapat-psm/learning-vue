import { ref, shallowRef, toValue, watch, onScopeDispose, type MaybeRefOrGetter } from 'vue'
import { http } from '@/api/http'

/**
 * Hand-rolled data fetching, to see what TanStack Query does for you.
 * React version: useEffect(() => { const c = new AbortController(); ... ; return () => c.abort() }, [url])
 *
 * What you get: data / error / isLoading, refetch, and cancel when the URL changes or the
 * component unmounts.
 * What you DON'T get (→ TanStack Query): cache, dedupe, retry, refetch on focus, invalidation.
 */
export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  // shallowRef: the response is replaced as a whole, no need for deep reactivity
  const data = shallowRef<T>()
  const error = shallowRef<Error>()
  const isLoading = ref(false)
  let controller: AbortController | undefined

  async function execute() {
    controller?.abort() // a newer request wins; cancel the old one (no race conditions)
    const current = (controller = new AbortController())
    isLoading.value = true
    error.value = undefined
    try {
      data.value = await http<T>(toValue(url), { signal: current.signal })
    } catch (e) {
      if (!current.signal.aborted) error.value = e as Error // aborts are not errors
    } finally {
      if (controller === current) isLoading.value = false
    }
  }

  // No dependency array: Vue tracks toValue(url) by itself. immediate = run on mount too.
  watch(() => toValue(url), execute, { immediate: true })
  // ≈ the useEffect cleanup: unmount → cancel
  onScopeDispose(() => controller?.abort())

  return { data, error, isLoading, refetch: execute }
}
