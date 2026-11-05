import { describe, expect, it } from 'vitest'
import { createAppQueryClient } from '../queryClient'
import { ApiError } from '../http'

// Config is code too: test the retry POLICY as a plain function, no component needed.
const retry = createAppQueryClient().getDefaultOptions().queries!.retry as (
  failureCount: number,
  error: Error,
) => boolean

describe('retry policy', () => {
  it.each([
    ['network error, 1st failure', 0, new TypeError('Failed to fetch'), true],
    ['500, 1st failure', 0, new ApiError(500, undefined), true],
    ['500, 2nd failure', 1, new ApiError(500, undefined), false],
    ['404 never retries', 0, new ApiError(404, undefined), false],
    ['422 never retries', 0, new ApiError(422, undefined), false],
  ])('%s → %s', (_name, count, error, expected) => {
    expect(retry(count, error)).toBe(expected)
  })

  it('keeps data fresh for 30 s', () => {
    expect(createAppQueryClient().getDefaultOptions().queries!.staleTime).toBe(30_000)
  })
})
