import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useTasks } from '../useTasks'

// No component, no mount: composables are plain functions.
describe('useTasks', () => {
  beforeEach(() => localStorage.clear())

  it('starts with default tasks', () => {
    const { tasks, remaining } = useTasks()
    expect(tasks.value).toHaveLength(2)
    expect(remaining.value).toBe(1)
  })

  it('adds, toggles and removes', () => {
    const { tasks, remaining, addTask, toggleTask, removeTask } = useTasks()
    addTask('New')
    const id = tasks.value[tasks.value.length - 1]!.id
    expect(id).toBe(3)
    expect(remaining.value).toBe(2)
    toggleTask(id)
    expect(remaining.value).toBe(1)
    removeTask(id)
    expect(tasks.value).toHaveLength(2)
  })

  it('filters visible tasks', () => {
    const { filter, visibleTasks } = useTasks()
    filter.value = 'active'
    expect(visibleTasks.value.map((t) => t.title)).toEqual(['Learn composables'])
    filter.value = 'done'
    expect(visibleTasks.value.map((t) => t.title)).toEqual(['Learn ref & computed'])
  })

  it('clears completed', () => {
    const { tasks, clearCompleted } = useTasks()
    clearCompleted()
    expect(tasks.value.every((t) => !t.done)).toBe(true)
  })

  it('persists across instances (like a page reload)', async () => {
    useTasks().addTask('Saved')
    await nextTick()
    expect(useTasks().tasks.value.map((t) => t.title)).toContain('Saved')
  })
})
