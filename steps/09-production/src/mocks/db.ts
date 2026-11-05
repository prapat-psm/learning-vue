import type { Task } from '@/types'

/**
 * The "database" of our fake backend. In the browser it is saved to localStorage,
 * so a page reload keeps your data, like a real server would.
 */
const KEY = 'task-board:api-db'

export const SEED: Task[] = [
  { id: 1, title: 'Learn ref & computed', done: true, priority: 'medium', description: '' },
  { id: 2, title: 'Learn TanStack Query', done: false, priority: 'high', description: '' },
  { id: 3, title: 'Mock the API with MSW', done: false, priority: 'low', description: '' },
]

const persist = import.meta.env.MODE !== 'test'

function load(): Task[] {
  if (!persist) return structuredClone(SEED)
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : structuredClone(SEED)
  } catch {
    return structuredClone(SEED)
  }
}

let tasks = load()

export const db = {
  all: () => tasks,
  find: (id: number) => tasks.find((t) => t.id === id),
  nextId: () => tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1,
  titleTaken: (title: string, exceptId?: number) =>
    tasks.some((t) => t.id !== exceptId && t.title.toLowerCase() === title.trim().toLowerCase()),
  insert(task: Task) {
    tasks.push(task)
    save()
  },
  update(id: number, patch: Partial<Task>) {
    const task = db.find(id)
    if (task) Object.assign(task, patch)
    save()
    return task
  },
  remove(id: number) {
    tasks = tasks.filter((t) => t.id !== id)
    save()
  },
  reset(seed: Task[] = SEED) {
    tasks = structuredClone(seed)
    save()
  },
}

function save() {
  if (persist) localStorage.setItem(KEY, JSON.stringify(tasks))
}
