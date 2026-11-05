import type { Component } from 'vue'

export interface PlaygroundStep {
  id: string
  title: string
  load: () => Promise<Component>
}

// Each earlier step's real App.vue, imported straight from its folder.
// Dynamic import() = lazy route: step 01's code is only downloaded when you open /playground/01.
// vite.config.ts has a small plugin so '@/...' inside each step resolves to THAT step's src.
export const playgroundSteps: PlaygroundStep[] = [
  { id: '01', title: 'Reactivity', load: () => import('../../../01-reactivity/src/App.vue') },
  { id: '02', title: 'Components', load: () => import('../../../02-components/src/App.vue') },
  { id: '03', title: 'Composables', load: () => import('../../../03-composables/src/App.vue') },
  // Step 04's App.vue is a router shell (<RouterView>), so show its board view instead
  { id: '04', title: 'Router', load: () => import('../../../04-router/src/views/BoardView.vue') },
  // Same for 05. Its store has the same id ('tasks') as ours, so Pinia hands it OUR store instance.
  { id: '05', title: 'Pinia', load: () => import('../../../05-pinia/src/views/BoardView.vue') },
]
