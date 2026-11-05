import type { RouteRecordRaw } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import { playgroundSteps } from '@/playground/steps'

// Step 07: the `taskExists` guard is gone. The router can't know if task 999 exists
// without asking the server, so each view shows its own 404 from the API response.
// (≈ calling notFound() inside a Next.js page after fetching.)

// Next.js App Router is file-based (app/tasks/[id]/page.tsx).
// Vue Router is config-based: you list routes yourself.
export const routes: RouteRecordRaw[] = [
  // Eager route: part of the main bundle
  { path: '/', name: 'board', component: BoardView, meta: { title: 'Board' } },

  {
    path: '/tasks/new', // no conflict with /tasks/:id because :id only matches digits
    name: 'task-new',
    component: () => import('@/views/TaskNewView.vue'),
    meta: { title: 'New task' },
  },
  {
    path: '/tasks/:id(\\d+)/edit',
    name: 'task-edit',
    component: () => import('@/views/TaskEditView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Edit task' },
  },

  {
    // :id ≈ app/tasks/[id]. (\\d+) = only digits match, so /tasks/abc → 404
    path: '/tasks/:id(\\d+)',
    name: 'task',
    // Lazy route ≈ next/dynamic: this view is a separate JS chunk, loaded on first visit
    component: () => import('@/views/TaskDetailView.vue'),
    // props function: turn the string param into a typed prop. Component stays router-agnostic.
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Task' },
  },

  {
    // Nested routes ≈ app/playground/layout.tsx + app/playground/[step]/page.tsx
    path: '/playground',
    component: () => import('@/playground/PlaygroundLayout.vue'),
    children: [
      {
        path: '',
        name: 'playground',
        component: () => import('@/playground/PlaygroundHome.vue'),
        meta: { title: 'Playground' },
      },
      // One lazy child route per earlier step: /playground/01, /playground/02, ...
      ...playgroundSteps.map((step) => ({
        path: step.id,
        name: `playground-${step.id}`,
        component: step.load,
        meta: { title: `Step ${step.id}` },
      })),
    ],
  },

  // Step 09: try the ErrorBoundary
  {
    path: '/debug/error',
    name: 'debug-error',
    component: () => import('@/views/CrashView.vue'),
    meta: { title: 'Crash test' },
  },

  // Catch-all ≈ app/not-found.tsx. Must be last.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]
