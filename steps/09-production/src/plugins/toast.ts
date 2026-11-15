import {
  inject,
  readonly,
  ref,
  type DeepReadonly,
  type InjectionKey,
  type Plugin,
  type Ref,
} from 'vue'

export type ToastKind = 'success' | 'error'
export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

export interface ToastApi {
  toasts: DeepReadonly<Ref<Toast[]>>
  show: (message: string, kind?: ToastKind) => void
  dismiss: (id: number) => void
}

/**
 * provide / inject ≈ React Context.
 *   InjectionKey<T>     ≈ createContext<T>()  (typed key)
 *   app.provide(key, v) ≈ <ToastContext.Provider value={v}> at the root
 *   inject(key)         ≈ useContext(ToastContext)
 * Why not Pinia? A toast service is app infrastructure, not app state. A plugin + inject
 * is the Vue way to ship it (vue-router and vue-query are installed exactly like this).
 */
export const ToastKey: InjectionKey<ToastApi> = Symbol('toast')

export function createToast({ duration = 4000 } = {}): Plugin {
  return {
    install(app) {
      const toasts = ref<Toast[]>([])
      let nextId = 1

      function dismiss(id: number) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }
      function show(message: string, kind: ToastKind = 'success') {
        const id = nextId++
        toasts.value.push({ id, message, kind })
        setTimeout(() => dismiss(id), duration)
      }

      // readonly: consumers can read the list but only change it through show/dismiss
      app.provide(ToastKey, { toasts: readonly(toasts), show, dismiss })
    },
  }
}

export function useToast(): ToastApi {
  const toast = inject(ToastKey)
  // Fail loudly: a missing provider is a setup bug, not something to silently ignore
  if (!toast) throw new Error('useToast() needs app.use(createToast())')
  return toast
}
