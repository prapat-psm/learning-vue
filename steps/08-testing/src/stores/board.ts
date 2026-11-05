import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TaskFilter } from '@/types'

/**
 * Step 07 split:
 *   SERVER state (tasks from the API) → TanStack Query (src/queries/tasks.ts)
 *   CLIENT state (UI only, never sent to the server) → Pinia
 * Same split as React: react-query for data + Zustand for UI.
 * The old 'tasks' store is gone: the cache IS the store now.
 */
export const useBoardStore = defineStore('board', () => {
  const filter = ref<TaskFilter>('all')
  return { filter }
})
