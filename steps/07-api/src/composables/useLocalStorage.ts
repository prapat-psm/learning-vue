import { ref, watch, type Ref } from 'vue'

/**
 * A ref that is saved to localStorage.
 * React equivalent: a custom hook `useLocalStorage(key, initial)` returning [value, setValue].
 * In Vue we just return a ref: write to `.value` and it persists.
 */
// structuredClone: never hand out `initial` itself. ref() wraps the SAME array,
// so a push would silently change the default for every future caller.
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const state = ref(read()) as Ref<T>

  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? structuredClone(initial) : (JSON.parse(raw) as T)
    } catch {
      return structuredClone(initial) // corrupted JSON or storage blocked: fall back
    }
  }

  // deep: true → also fires when nested data changes (task.done = true)
  // React would need you to call setValue with a new object instead.
  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // quota exceeded or private mode: keep working in memory
      }
    },
    { deep: true },
  )

  return state
}
