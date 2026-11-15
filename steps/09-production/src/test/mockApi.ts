import { delay, http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { db } from '@/mocks/db'
import type { Task } from '@/types'

type Method = 'get' | 'post' | 'patch' | 'delete'

/**
 * Readable helpers for API scenarios, so tests read like a spec:
 *   mockApi.seed([buildTask({ done: true })])
 *   mockApi.fail('patch', '/tasks/:id', 500)
 * They all build on MSW's server.use(), which is reset after each test (src/test/setup.ts).
 */
export const mockApi = {
  /** Replace the "server database" with exactly these tasks. */
  seed(tasks: Task[]) {
    db.reset(tasks)
  },

  /** Make one endpoint answer with an error. `once` = only the next request fails. */
  fail(method: Method, path: string, status = 500, { once = false } = {}) {
    server.use(
      http[method](
        `*/api${path}`,
        () => HttpResponse.json({ message: `Server error ${status}` }, { status }),
        { once },
      ),
    )
  },

  /** Network error (no response at all), like being offline. */
  networkError(method: Method, path: string) {
    server.use(http[method](`*/api${path}`, () => HttpResponse.error()))
  },

  /** Keep the request pending forever: test loading states without racing the response. */
  hang(method: Method, path: string) {
    server.use(
      http[method](`*/api${path}`, async () => {
        await delay('infinite')
        return HttpResponse.json(null)
      }),
    )
  },

  /** Record every request (method + path) to assert what the app sent. */
  record() {
    const calls: { method: string; path: string; body: unknown }[] = []
    server.events.on('request:start', async ({ request }) => {
      const body =
        request.method === 'GET'
          ? undefined
          : await request
              .clone()
              .json()
              .catch(() => undefined)
      calls.push({ method: request.method, path: new URL(request.url).pathname, body })
    })
    return calls
  },
}
