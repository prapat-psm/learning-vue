import { http } from './http'
import type { Task } from '@/types'
import type { TaskInput } from '@/schemas/task'

export type TaskPatch = Partial<TaskInput> & { done?: boolean }

/**
 * All task endpoints in one place. Views never call fetch() directly.
 * `signal` lets the caller cancel (TanStack Query passes one for you).
 */
export const tasksApi = {
  list: (signal?: AbortSignal) => http<Task[]>('/tasks', { signal }),
  get: (id: number, signal?: AbortSignal) => http<Task>(`/tasks/${id}`, { signal }),
  create: (input: TaskInput) => http<Task>('/tasks', { method: 'POST', json: input }),
  update: (id: number, patch: TaskPatch) =>
    http<Task>(`/tasks/${id}`, { method: 'PATCH', json: patch }),
  remove: (id: number) => http<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
