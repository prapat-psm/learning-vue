export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  done: boolean
  // Optional: tasks saved by steps 01-05 don't have these yet
  description?: string
  priority?: Priority
  dueDate?: string // YYYY-MM-DD
}

export type TaskFilter = 'all' | 'active' | 'done'
