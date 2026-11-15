import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/vue'
// Adds DOM matchers: toBeInTheDocument, toBeChecked, toHaveAccessibleName... (same as in React)
import '@testing-library/jest-dom/vitest'
import { server } from '@/mocks/node'
import { db } from '@/mocks/db'

// MSW for every test file: real fetch() → our handlers. No vi.mock('fetch') needed.
// onUnhandledRequest: 'error' → a request we forgot to mock fails the test loudly.
// jsdom has no scrolling; the router's scrollBehavior calls it on every navigation
window.scrollTo = (() => {}) as typeof window.scrollTo

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup() // unmount Testing Library renders (automatic only with `globals: true`)
  server.resetHandlers() // drop per-test overrides from server.use(...)
  db.reset() // fresh "database" for the next test
  localStorage.clear()
})
afterAll(() => server.close())
