import { inject, shallowRef, type InjectionKey, type Plugin, type ShallowRef } from 'vue'

export interface ConfirmRequest {
  message: string
  confirmLabel: string
  cancelLabel: string
  resolve: (ok: boolean) => void
}

export interface ConfirmApi {
  /** The open dialog, or undefined. Read by <ConfirmHost>. */
  current: Readonly<ShallowRef<ConfirmRequest | undefined>>
  /** Promise-based replacement for window.confirm(): `if (await confirm.ask('Sure?')) ...` */
  ask: (message: string, labels?: { confirm?: string; cancel?: string }) => Promise<boolean>
}

/**
 * Why replace window.confirm()? It blocks the whole page, can't be styled or translated well,
 * and some browsers suppress it. A dialog rendered by the app is the production way.
 * The trick: ask() returns a Promise, and the dialog buttons resolve it.
 */
export const ConfirmKey: InjectionKey<ConfirmApi> = Symbol('confirm')

export function createConfirm(): Plugin {
  return {
    install(app) {
      const current = shallowRef<ConfirmRequest>()

      function ask(message: string, labels: { confirm?: string; cancel?: string } = {}) {
        current.value?.resolve(false) // only one dialog at a time
        return new Promise<boolean>((resolve) => {
          current.value = {
            message,
            confirmLabel: labels.confirm ?? 'OK',
            cancelLabel: labels.cancel ?? 'Cancel',
            resolve: (ok) => {
              current.value = undefined
              resolve(ok)
            },
          }
        })
      }

      app.provide(ConfirmKey, { current, ask })
    },
  }
}

export function useConfirm(): ConfirmApi {
  const confirm = inject(ConfirmKey)
  if (!confirm) throw new Error('useConfirm() needs app.use(createConfirm())')
  return confirm
}
