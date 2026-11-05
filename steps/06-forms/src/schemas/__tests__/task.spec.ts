import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { taskSchema, titleSchema, today } from '../task'

// Freeze "today" so date rules are deterministic
beforeEach(() => vi.useFakeTimers({ now: new Date('2026-11-05T10:00:00') }))
afterEach(() => vi.useRealTimers())

const valid = { title: 'Write tests', priority: 'high' as const }

describe('task schema', () => {
  it('accepts valid input and fills defaults', () => {
    expect(taskSchema.parse(valid)).toEqual({ ...valid, description: '' })
  })

  it('trims strings before checking length', () => {
    expect(titleSchema.parse('  Hello  ')).toBe('Hello')
    expect(titleSchema.safeParse('  ab  ').success).toBe(false)
  })

  it.each([
    [{ title: 'ab' }, 'title', 'Title needs at least 3 characters'],
    [{ title: 'x'.repeat(81) }, 'title', 'Title can be at most 80 characters'],
    [{ priority: 'urgent' }, 'priority', 'Choose a priority'],
    [{ dueDate: '2026-11-04' }, 'dueDate', 'Due date cannot be in the past'],
    [{ description: 'x'.repeat(501) }, 'description', 'Description can be at most 500 characters'],
  ])('rejects %o', (patch, path, message) => {
    const result = taskSchema.safeParse({ ...valid, ...patch })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]).toMatchObject({ path: [path], message })
  })

  it('allows today and no due date', () => {
    expect(today()).toBe('2026-11-05')
    expect(taskSchema.safeParse({ ...valid, dueDate: '2026-11-05' }).success).toBe(true)
    expect(taskSchema.safeParse({ ...valid, dueDate: '' }).success).toBe(true)
  })
})
