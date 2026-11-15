import { ApiError } from './http'
import type { TaskInput } from '@/schemas/task'

type SetFieldError = (field: keyof TaskInput, message: string) => void

/**
 * Map a 422 response into form field errors (step 06 did this by hand with the store).
 * Returns false if it was not a validation error, so the caller shows a general message.
 */
export function applyServerErrors(error: unknown, setFieldError: SetFieldError) {
  if (!(error instanceof ApiError) || error.status !== 422 || !error.body?.fieldErrors) return false
  for (const [field, message] of Object.entries(error.body.fieldErrors)) {
    setFieldError(field as keyof TaskInput, message)
  }
  return true
}
