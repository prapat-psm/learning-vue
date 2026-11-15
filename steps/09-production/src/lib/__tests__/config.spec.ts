import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/config'

describe('parseEnv', () => {
  it('uses safe defaults when nothing is set', () => {
    expect(parseEnv({ MODE: 'production' })).toEqual({
      mode: 'production',
      apiUrl: '/api',
      useMockApi: true,
      appTitle: 'Task Board',
      logErrors: true,
    })
  })

  it('reads a real API URL and turns the mock off', () => {
    const config = parseEnv({ MODE: 'production', VITE_API_URL: 'https://api.example.com' })
    expect(config.apiUrl).toBe('https://api.example.com')
    expect(config.useMockApi).toBe(false)
  })

  it('fails loudly with every bad variable listed', () => {
    expect(() =>
      parseEnv({ MODE: 'production', VITE_API_URL: 'not a url', VITE_LOG_ERRORS: 'yes' }),
    ).toThrowError(
      /Invalid environment variables:\n- VITE_API_URL: .*\n- VITE_LOG_ERRORS: VITE_LOG_ERRORS must be "true" or "false"/,
    )
  })
})
