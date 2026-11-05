import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Task, TaskFilter } from '@/types'
import type { TaskInput } from '@/schemas/task'
import { useLocalStorage } from '@/composables/useLocalStorage'

const DEFAULT_TASKS: Task[] = [
  { id: 1, title: 'Learn ref & computed', done: true, priority: 'medium' },
  { id: 2, title: 'Learn forms', done: false, priority: 'high' },
]

/**
 * Step 03's useTasks(), turned into a store. The body is almost identical.
 * The difference: useTasks() made NEW state on every call,
 * useTasksStore() returns the SAME instance everywhere (a singleton per app).
 *
 * React equivalent: Zustand `create((set) => ({ ... }))`, or Context + useReducer.
 * "Setup store" syntax = a composable. ref → state, computed → getters, function → actions.
 */
export const useTasksStore = defineStore('tasks', () => {
  // state
  const tasks = useLocalStorage<Task[]>('task-board:tasks', DEFAULT_TASKS)
  const filter = ref<TaskFilter>('all')

  // getters
  const remaining = computed(() => tasks.value.filter((t) => !t.done).length)
  const visibleTasks = computed(() => {
    if (filter.value === 'active') return tasks.value.filter((t) => !t.done)
    if (filter.value === 'done') return tasks.value.filter((t) => t.done)
    return tasks.value
  })
  const byId = computed(() => (id: number) => tasks.value.find((t) => t.id === id))

  // actions
  function nextId() {
    return tasks.value.reduce((max, t) => Math.max(max, t.id), 0) + 1
  }

  // Quick add from the board (title only)
  function addTask(title: string) {
    tasks.value.push({ id: nextId(), title, done: false, priority: 'medium' })
  }

  // Full form (step 06). Input is already validated by the Zod schema.
  function createTask(input: TaskInput): Task {
    const task: Task = { id: nextId(), done: false, ...input }
    tasks.value.push(task)
    return task
  }

  function updateTask(id: number, input: TaskInput) {
    const task = byId.value(id)
    if (task) Object.assign(task, input)
  }

  // Business rule the schema can't know: titles must be unique (≈ a server-side check)
  function isTitleTaken(title: string, exceptId?: number) {
    const t = title.trim().toLowerCase()
    return tasks.value.some((task) => task.id !== exceptId && task.title.toLowerCase() === t)
  }

  function toggleTask(id: number) {
    const task = byId.value(id)
    if (task) task.done = !task.done
  }

  function removeTask(id: number) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter((t) => !t.done)
  }

  // Setup stores have no built-in $reset(); write your own when you need it
  function $reset() {
    tasks.value = structuredClone(DEFAULT_TASKS)
    filter.value = 'all'
  }

  // Everything returned is public. All state must be returned or devtools/SSR can't see it.
  return {
    tasks,
    filter,
    remaining,
    visibleTasks,
    byId,
    addTask,
    createTask,
    updateTask,
    isTitleTaken,
    toggleTask,
    removeTask,
    clearCompleted,
    $reset,
  }
})

// Keep store state while editing this file in dev (Vite HMR)
if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
