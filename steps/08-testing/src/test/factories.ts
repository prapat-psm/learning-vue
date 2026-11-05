import type { Task } from '@/types'

/**
 * Test data factory. Each test says only what MATTERS to it:
 *   buildTask({ done: true })  instead of a 6-line object literal.
 * Same idea as fishery / @mswjs/data in React projects.
 */
let nextId = 100

export function buildTask(overrides: Partial<Task> = {}): Task {
  const id = overrides.id ?? nextId++
  return {
    id,
    title: `Task ${id}`,
    done: false,
    priority: 'medium',
    description: '',
    ...overrides,
  }
}

export const buildTasks = (count: number, overrides: Partial<Task> = {}) =>
  Array.from({ length: count }, () => buildTask(overrides))
