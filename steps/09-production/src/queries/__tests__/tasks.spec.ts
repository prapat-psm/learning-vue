import { afterEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { delay, http, HttpResponse } from 'msw'
import { VueQueryPlugin, type QueryClient } from '@tanstack/vue-query'
import { server } from '@/mocks/node'
import { withSetup } from '@/test/withSetup'
import { createTestQueryClient } from '@/test/mountApp'
import { taskKeys, useTasksQuery, useToggleTask } from '../tasks'
import type { Task } from '@/types'

let app: App | undefined
afterEach(() => app?.unmount())

function setup<T>(composable: () => T): [T, QueryClient] {
  const queryClient = createTestQueryClient()
  let result
  ;[result, app] = withSetup(composable, [[VueQueryPlugin, { queryClient }]])
  return [result, queryClient]
}

describe('useTasksQuery', () => {
  it('loads tasks and caches them under the list key', async () => {
    const [query, qc] = setup(() => useTasksQuery())
    expect(query.isPending.value).toBe(true)
    await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))
    expect(query.data.value).toHaveLength(3)
    expect(qc.getQueryData<Task[]>(taskKeys.list())).toHaveLength(3)
  })

  it('two components with the same key share ONE request (dedupe)', async () => {
    const onRequest = vi.fn<() => void>()
    server.events.on('request:start', onRequest)
    const [both] = setup(() => [useTasksQuery(), useTasksQuery()] as const)
    await vi.waitFor(() => expect(both[1].isSuccess.value).toBe(true))
    expect(onRequest).toHaveBeenCalledOnce()
    server.events.removeAllListeners()
  })
})

describe('useToggleTask (optimistic update)', () => {
  const doneOf = (qc: QueryClient, id: number) =>
    qc.getQueryData<Task[]>(taskKeys.list())?.find((t) => t.id === id)?.done

  it('updates the cache BEFORE the server answers', async () => {
    server.use(
      http.patch('*/api/tasks/:id', async () => {
        await delay(50)
        return HttpResponse.json({ id: 2, title: 'Learn TanStack Query', done: true })
      }),
    )
    const [{ query, toggle }, qc] = setup(() => ({
      query: useTasksQuery(),
      toggle: useToggleTask(),
    }))
    await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))

    toggle.mutate(query.data.value!.find((t) => t.id === 2)!)
    await vi.waitFor(() => expect(doneOf(qc, 2)).toBe(true)) // instant
    expect(toggle.isPending.value).toBe(true) // ...while the request is still running
  })

  it('rolls back when the server fails', async () => {
    server.use(
      http.patch('*/api/tasks/:id', async () => {
        await delay(100)
        return HttpResponse.json({ message: 'DB is down' }, { status: 500 })
      }),
    )
    const [{ query, toggle }, qc] = setup(() => ({
      query: useTasksQuery(),
      toggle: useToggleTask(),
    }))
    await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))

    toggle.mutate(query.data.value!.find((t) => t.id === 2)!)
    await vi.waitFor(() => expect(doneOf(qc, 2)).toBe(true))
    await vi.waitFor(() => expect(toggle.isError.value).toBe(true))
    expect(doneOf(qc, 2)).toBe(false) // back to the server's truth
    expect(toggle.error.value?.message).toBe('DB is down')
  })
})
