import { describe, expect, it } from 'vitest'
import { http as mswHttp, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { ApiError, http } from '../http'
import { tasksApi } from '../tasks'

describe('http()', () => {
  it('returns parsed JSON', async () => {
    const tasks = await tasksApi.list()
    expect(tasks.map((t) => t.title)).toContain('Learn TanStack Query')
  })

  it('throws ApiError with status + server message on 4xx (fetch alone would not throw)', async () => {
    const error = await tasksApi.get(999).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(404)
    expect(error.message).toBe('Task 999 not found')
  })

  it('sends JSON and returns 422 field errors from the server', async () => {
    const error = await tasksApi
      .create({ title: 'learn tanstack query', description: '', priority: 'low' })
      .catch((e) => e)
    expect(error.status).toBe(422)
    expect(error.body.fieldErrors).toEqual({ title: 'A task with this title already exists' })
  })

  it('works with any status: per-test override with server.use()', async () => {
    server.use(mswHttp.get('*/api/boom', () => new HttpResponse(null, { status: 500 })))
    await expect(http('/boom')).rejects.toThrow('Request failed with status 500')
  })
})
