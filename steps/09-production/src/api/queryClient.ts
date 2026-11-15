import { QueryClient } from '@tanstack/vue-query'
import { ApiError } from './http'

/**
 * One QueryClient = one cache for all server data in the app.
 * Same API as @tanstack/react-query, so your React knowledge transfers 1:1.
 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // data is "fresh" for 30 s → no refetch when you navigate back
        // Retry network/5xx errors once, never 4xx (a 404 won't fix itself)
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) && failureCount < 1,
      },
    },
  })
}
