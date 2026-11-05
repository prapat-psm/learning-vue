/**
 * A tiny fetch wrapper. Every real project has one (or uses ky / ofetch / axios).
 * It does the 3 things raw fetch() does NOT do for you:
 *   1. throw on HTTP errors (fetch only rejects on network errors, a 500 still "succeeds")
 *   2. parse JSON
 *   3. send JSON bodies with the right header
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | undefined,
  ) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
  }
}

/** Shape our API uses for errors. 422 → fieldErrors (like a server action returning errors). */
export interface ApiErrorBody {
  message: string
  fieldErrors?: Record<string, string>
}

const BASE = import.meta.env.VITE_API_URL || '/api'

interface HttpOptions extends Omit<RequestInit, 'body'> {
  json?: unknown
}

export async function http<T>(path: string, { json, headers, ...init }: HttpOptions = {}) {
  // Absolute URL: works in the browser AND in Node (tests), where fetch('/api') is invalid
  const url = new URL(BASE + path, window.location.origin)
  const res = await fetch(url, {
    ...init,
    headers: json === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
    body: json === undefined ? undefined : JSON.stringify(json),
  })

  const body = res.status === 204 ? undefined : await res.json().catch(() => undefined)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

/** Best human message for any error: first field error, else the error message. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const first = Object.values(error.body?.fieldErrors ?? {})[0]
    if (first) return first
  }
  return error instanceof Error ? error.message : String(error)
}
