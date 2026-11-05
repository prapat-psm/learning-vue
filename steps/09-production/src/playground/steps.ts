import type { Component } from 'vue'

export interface PlaygroundStep {
  id: string
  title: string
  load: () => Promise<Component>
}

/**
 * Steps 05 and 06 both define a Pinia store with id 'tasks' (06's has more actions).
 * Pinia keeps the FIRST one created per id, so create 06's store first: both boards then
 * share it and nothing is missing. (Step 07 itself has no 'tasks' store anymore.)
 * Note: these boards keep tasks in localStorage. Step 07 keeps them on the (mock) server.
 */
async function withTasksStore<T>(load: () => Promise<T>) {
  const { useTasksStore } = await import('../../../06-forms/src/stores/tasks')
  useTasksStore()
  return load()
}

// Each earlier step's real App.vue, imported straight from its folder.
// Dynamic import() = lazy route: step 01's code is only downloaded when you open /playground/01.
// vite.config.ts has a small plugin so '@/...' inside each step resolves to THAT step's src.
export const playgroundSteps: PlaygroundStep[] = [
  { id: '01', title: 'Reactivity', load: () => import('../../../01-reactivity/src/App.vue') },
  { id: '02', title: 'Components', load: () => import('../../../02-components/src/App.vue') },
  { id: '03', title: 'Composables', load: () => import('../../../03-composables/src/App.vue') },
  // Steps 04+ App.vue is a router shell (<RouterView>), so show their board view instead
  { id: '04', title: 'Router', load: () => import('../../../04-router/src/views/BoardView.vue') },
  {
    id: '05',
    title: 'Pinia',
    load: () => withTasksStore(() => import('../../../05-pinia/src/views/BoardView.vue')),
  },
  {
    id: '06',
    title: 'Forms',
    load: () => withTasksStore(() => import('../../../06-forms/src/views/BoardView.vue')),
  },
  // 07 uses the same query keys + MSW API as this app, so it shares our Query cache
  { id: '07', title: 'API', load: () => import('../../../07-api/src/views/BoardView.vue') },
  {
    id: '08',
    title: 'Testing',
    load: () => import('../../../08-testing/src/views/BoardView.vue'),
  },
]
