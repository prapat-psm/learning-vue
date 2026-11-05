import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref, type App } from 'vue'
import { delay, http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { withSetup } from '@/test/withSetup'
import { useFetch } from '../useFetch'
import type { Task } from '@/types'

let app: App | undefined
afterEach(() => app?.unmount())

const until = async (check: () => boolean) => {
  for (let i = 0; i < 50 && !check(); i++) await new Promise((r) => setTimeout(r, 5))
}

describe('useFetch (hand-rolled)', () => {
  it('goes loading → data', async () => {
    let result
    ;[result, app] = withSetup(() => useFetch<Task>('/tasks/2'))
    expect(result.isLoading.value).toBe(true)
    await until(() => !result.isLoading.value)
    expect(result.data.value?.title).toBe('Learn TanStack Query')
    expect(result.error.value).toBeUndefined()
  })

  it('exposes the error', async () => {
    let result
    ;[result, app] = withSetup(() => useFetch<Task>('/tasks/999'))
    await until(() => !result.isLoading.value)
    expect(result.error.value?.message).toBe('Task 999 not found')
  })

  it('cancels the old request when the URL changes (no race condition)', async () => {
    // Make task 1 slow: without abort, its late answer would overwrite task 3
    server.use(
      http.get('*/api/tasks/1', async () => {
        await delay(100)
        return HttpResponse.json({ id: 1, title: 'SLOW, should never show', done: false })
      }),
    )
    const id = ref(1)
    let result
    ;[result, app] = withSetup(() => useFetch<Task>(() => `/tasks/${id.value}`))
    id.value = 3
    await nextTick()
    await until(() => !result.isLoading.value)
    await new Promise((r) => setTimeout(r, 150))
    expect(result.data.value?.title).toBe('Mock the API with MSW')
    expect(result.error.value).toBeUndefined() // the abort is not reported as an error
  })
})
