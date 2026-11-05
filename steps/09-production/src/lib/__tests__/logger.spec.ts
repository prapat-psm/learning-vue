import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '../logger'

afterEach(() => {
  logger.reports.length = 0
  vi.restoreAllMocks()
})

describe('logger.reportError', () => {
  it('keeps a report with context and a timestamp, and logs it', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('nope')
    const report = logger.reportError(error, { source: 'test' })

    expect(report).toMatchObject({ error, context: { source: 'test' } })
    expect(Date.parse(report.at)).not.toBeNaN()
    expect(logger.reports).toHaveLength(1)
    expect(consoleError).toHaveBeenCalledWith('[task-board]', error, { source: 'test' })
  })
})
