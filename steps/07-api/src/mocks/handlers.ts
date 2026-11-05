import { delay, http, HttpResponse } from 'msw'
import { z } from 'zod'
import { taskSchema } from '@/schemas/task'
import type { ApiErrorBody } from '@/api/http'
import type { Task } from '@/types'
import { db } from './db'

/**
 * MSW = Mock Service Worker. It intercepts REAL fetch() calls:
 * - in the browser via a Service Worker (public/mockServiceWorker.js)
 * - in Vitest via Node interceptors (src/mocks/node.ts)
 * So the app code is 100% production code. Swap in a real API by setting VITE_API_URL.
 *
 * Handlers ≈ Next.js Route Handlers (app/api/tasks/route.ts), but fake.
 * '*' prefix = match any origin.
 */

const patchSchema = taskSchema.partial().extend({ done: z.boolean().optional() })

// Same Zod schema as the form → client and "server" can't disagree (≈ shared schema in a server action)
function invalid(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
  return HttpResponse.json<ApiErrorBody>(
    { message: 'Validation failed', fieldErrors },
    { status: 422 },
  )
}

const duplicate = () =>
  HttpResponse.json<ApiErrorBody>(
    {
      message: 'Validation failed',
      fieldErrors: { title: 'A task with this title already exists' },
    },
    { status: 422 },
  )

const notFound = (id: number) =>
  HttpResponse.json<ApiErrorBody>({ message: `Task ${id} not found` }, { status: 404 })

export const handlers = [
  http.get('*/api/tasks', async () => {
    await delay() // realistic random latency in the browser, 0 ms in Node
    return HttpResponse.json(db.all())
  }),

  http.get('*/api/tasks/:id', async ({ params }) => {
    await delay()
    const task = db.find(Number(params.id))
    return task ? HttpResponse.json(task) : notFound(Number(params.id))
  }),

  http.post('*/api/tasks', async ({ request }) => {
    await delay()
    const parsed = taskSchema.safeParse(await request.json())
    if (!parsed.success) return invalid(parsed.error)
    if (db.titleTaken(parsed.data.title)) return duplicate()
    const task: Task = { id: db.nextId(), done: false, ...parsed.data }
    db.insert(task)
    return HttpResponse.json(task, { status: 201 })
  }),

  http.patch('*/api/tasks/:id', async ({ params, request }) => {
    await delay()
    const id = Number(params.id)
    if (!db.find(id)) return notFound(id)
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) return invalid(parsed.error)
    if (parsed.data.title && db.titleTaken(parsed.data.title, id)) return duplicate()
    return HttpResponse.json(db.update(id, parsed.data))
  }),

  http.delete('*/api/tasks/:id', async ({ params }) => {
    await delay()
    const id = Number(params.id)
    if (!db.find(id)) return notFound(id)
    db.remove(id)
    return new HttpResponse(null, { status: 204 })
  }),
]
