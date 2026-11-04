import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useTasksStore } from '../tasks'

// A fresh Pinia per test = no state leaks between tests
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('tasks store', () => {
  it('returns the SAME instance on every call (the step 04 problem, fixed)', () => {
    const a = useTasksStore()
    const b = useTasksStore()
    a.addTask('Shared')
    expect(b.tasks.map((t) => t.title)).toContain('Shared')
    expect(a).toBe(b)
  })

  it('getters: remaining, visibleTasks, byId', () => {
    const store = useTasksStore()
    expect(store.remaining).toBe(1) // no .value: the store unwraps refs
    store.filter = 'done'
    expect(store.visibleTasks.map((t) => t.id)).toEqual([1])
    expect(store.byId(2)?.title).toBe('Learn Pinia')
    expect(store.byId(99)).toBeUndefined()
  })

  it('actions: add, toggle, remove, clearCompleted', () => {
    const store = useTasksStore()
    store.addTask('New')
    expect(store.tasks[store.tasks.length - 1]).toEqual({ id: 3, title: 'New', done: false })
    store.toggleTask(3)
    expect(store.remaining).toBe(1)
    store.removeTask(2)
    store.clearCompleted()
    expect(store.tasks).toEqual([])
  })

  it('persists to localStorage and survives a new Pinia (page reload)', async () => {
    useTasksStore().addTask('Saved')
    await nextTick()
    setActivePinia(createPinia())
    expect(useTasksStore().tasks.map((t) => t.title)).toContain('Saved')
  })

  it('$reset restores defaults', () => {
    const store = useTasksStore()
    store.clearCompleted()
    store.filter = 'active'
    store.$reset()
    expect(store.tasks).toHaveLength(2)
    expect(store.filter).toBe('all')
  })

  it('$patch updates several fields at once', () => {
    const store = useTasksStore()
    store.$patch({ filter: 'active' })
    expect(store.filter).toBe('active')
  })
})
