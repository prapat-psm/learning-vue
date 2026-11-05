import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/mocks/node'
import { db } from '@/mocks/db'

// MSW for every test file: real fetch() → our handlers. No vi.mock('fetch') needed.
// onUnhandledRequest: 'error' → a request we forgot to mock fails the test loudly.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers() // drop per-test overrides from server.use(...)
  db.reset() // fresh "database" for the next test
})
afterAll(() => server.close())
