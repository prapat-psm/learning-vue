import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Same handlers, Node version. Used by src/test/setup.ts.
export const server = setupServer(...handlers)
