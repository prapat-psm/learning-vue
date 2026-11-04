import { computed, readonly, ref } from 'vue'
import type { Task, TaskFilter } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const DEFAULT_TASKS: Task[] = [
  { id: 1, title: 'Learn ref & computed', done: true },
  { id: 2, title: 'Learn composables', done: false },
]

/**
 * All task logic in one place, no template, no component.
 * React equivalent: a custom hook `useTasks()`.
 *
 * Difference from React hooks:
 * - Called once in setup(), not on every render, so no rules-of-hooks or deps arrays.
 * - You can even call it outside components (tests, other composables).
 */
export function useTasks(storageKey = 'task-board:tasks') {
  const tasks = useLocalStorage<Task[]>(storageKey, DEFAULT_TASKS)
  const filter = ref<TaskFilter>('all')

  const remaining = computed(() => tasks.value.filter((t) => !t.done).length)

  const visibleTasks = computed(() => {
    if (filter.value === 'active') return tasks.value.filter((t) => !t.done)
    if (filter.value === 'done') return tasks.value.filter((t) => t.done)
    return tasks.value
  })

  function nextId() {
    return tasks.value.reduce((max, t) => Math.max(max, t.id), 0) + 1
  }

  function addTask(title: string) {
    tasks.value.push({ id: nextId(), title, done: false })
  }

  function toggleTask(id: number) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.done = !task.done
  }

  function removeTask(id: number) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter((t) => !t.done)
  }

  // Convention: return an object of refs + functions.
  // readonly() stops callers from mutating tasks directly; they must use the actions.
  return {
    tasks: readonly(tasks),
    filter, // writable on purpose: bound with v-model
    remaining,
    visibleTasks,
    addTask,
    toggleTask,
    removeTask,
    clearCompleted,
  }
}
