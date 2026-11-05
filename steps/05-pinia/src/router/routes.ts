import type { RouteRecordRaw } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import { useTasksStore } from '@/stores/tasks'
import { playgroundSteps } from '@/playground/steps'

// Next.js App Router is file-based (app/tasks/[id]/page.tsx).
// Vue Router is config-based: you list routes yourself.
export const routes: RouteRecordRaw[] = [
  // Eager route: part of the main bundle
  { path: '/', name: 'board', component: BoardView, meta: { title: 'Board' } },

  {
    // :id ≈ app/tasks/[id]. (\\d+) = only digits match, so /tasks/abc → 404
    path: '/tasks/:id(\\d+)',
    name: 'task',
    // Lazy route ≈ next/dynamic: this view is a separate JS chunk, loaded on first visit
    component: () => import('@/views/TaskDetailView.vue'),
    // props function: turn the string param into a typed prop. Component stays router-agnostic.
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Task' },
    // Per-route guard ≈ notFound() in a Next.js page, but runs BEFORE the view renders
    beforeEnter: (to) => {
      // Stores work outside components too, once app.use(pinia) has run
      if (!useTasksStore().byId(Number(to.params.id))) {
        return {
          name: 'not-found',
          params: { pathMatch: to.path.slice(1).split('/') },
          replace: true,
        }
      }
    },
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

  // Catch-all ≈ app/not-found.tsx. Must be last.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]
