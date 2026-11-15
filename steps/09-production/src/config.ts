import { z } from 'zod'

/**
 * Env vars, validated ONCE at startup. A typo in .env fails loudly here,
 * not as a mysterious `undefined` deep in the app.
 * ≈ @t3-oss/env-nextjs, or a zod parse of process.env in Next.js.
 *
 * Only VITE_* vars reach the browser, and they are PUBLIC (they end up in the JS bundle).
 * Never put secrets here. (Next.js rule is the same for NEXT_PUBLIC_*.)
 */
const envSchema = z.object({
  MODE: z.string(),
  VITE_API_URL: z
    .union([z.literal(''), z.string().url('VITE_API_URL must be a full URL')])
    .optional(),
  VITE_APP_TITLE: z.string().min(1).default('Task Board'),
  VITE_LOG_ERRORS: z
    .enum(['true', 'false'], { message: 'VITE_LOG_ERRORS must be "true" or "false"' })
    .default('true')
    .transform((v) => v === 'true'),
})

export function parseEnv(env: Record<string, unknown>) {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    const lines = result.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`)
    throw new Error(`Invalid environment variables:\n${lines.join('\n')}`)
  }
  const env_ = result.data
  return {
    mode: env_.MODE,
    /** Real backend base URL, or our MSW mock at /api */
    apiUrl: env_.VITE_API_URL || '/api',
    useMockApi: !env_.VITE_API_URL,
    appTitle: env_.VITE_APP_TITLE,
    logErrors: env_.VITE_LOG_ERRORS,
  }
}

export const config = parseEnv(import.meta.env)
