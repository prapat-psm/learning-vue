import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, onMounted } from 'vue'
import { withSetup } from '@/test/withSetup'
import { createToast, useToast } from '../toast'
import { createConfirm, useConfirm } from '../confirm'
import { errorHandling } from '../errorHandling'
import { logger } from '@/lib/logger'

afterEach(() => vi.useRealTimers())

describe('toast service (provide/inject)', () => {
  it('shows a toast and removes it after the duration', () => {
    vi.useFakeTimers()
    const [toast] = withSetup(() => useToast(), [createToast({ duration: 1000 })])
    toast.show('Saved')
    expect(toast.toasts.value.map((t) => t.message)).toEqual(['Saved'])
    vi.advanceTimersByTime(1000)
    expect(toast.toasts.value).toEqual([])
  })

  it('throws a clear error when the plugin is missing (≈ useContext outside Provider)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => withSetup(() => useToast())).toThrowError(
      'useToast() needs app.use(createToast())',
    )
    warn.mockRestore()
  })
})

describe('confirm service', () => {
  it('ask() resolves with the button the user picked', async () => {
    const [confirm] = withSetup(() => useConfirm(), [createConfirm()])
    const answer = confirm.ask('Delete?', { confirm: 'Delete' })
    expect(confirm.current.value?.confirmLabel).toBe('Delete')
    confirm.current.value!.resolve(true)
    await expect(answer).resolves.toBe(true)
    expect(confirm.current.value).toBeUndefined()
  })

  it('a second ask() cancels the first one', async () => {
    const [confirm] = withSetup(() => useConfirm(), [createConfirm()])
    const first = confirm.ask('First?')
    confirm.ask('Second?')
    await expect(first).resolves.toBe(false)
    expect(confirm.current.value?.message).toBe('Second?')
  })
})

describe('global error handler', () => {
  it('reports errors no boundary caught (app.config.errorHandler)', async () => {
    const report = vi.spyOn(logger, 'reportError').mockImplementation(() => ({}) as never)
    const Broken = defineComponent({
      name: 'BrokenWidget',
      setup() {
        onMounted(() => {
          throw new Error('mounted failed')
        })
        return () => h('p', 'hi')
      },
    })
    const app = createApp(Broken).use(errorHandling)
    app.mount(document.createElement('div'))
    await nextTick()
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mounted failed' }),
      expect.objectContaining({ source: 'vue', component: 'BrokenWidget' }),
    )
    app.unmount()
    report.mockRestore()
  })
})
