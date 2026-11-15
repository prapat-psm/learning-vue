import { config } from '@/config'

export interface ErrorReport {
  error: unknown
  context: Record<string, unknown>
  at: string
}

/**
 * One place where every error ends up. In production you would send it to Sentry,
 * Datadog, etc. here. Views never call console.error themselves.
 */
export const logger = {
  reports: [] as ErrorReport[],

  reportError(error: unknown, context: Record<string, unknown> = {}) {
    const report = { error, context, at: new Date().toISOString() }
    logger.reports.push(report)
    if (config.logErrors) console.error('[task-board]', error, context)
    // e.g. Sentry.captureException(error, { extra: context })
    return report
  },
}
