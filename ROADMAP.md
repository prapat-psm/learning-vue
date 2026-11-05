# Vue.js Roadmap: basics → production

Mini project: **Task Board**, one app that grows every step. Each step is its own folder in `steps/`.
Stack: Vue 3.5 + Vite + TypeScript + Vitest + Vue Test Utils + ESLint/Prettier.

| # | Step | You learn | Next.js / React equivalent |
|---|------|-----------|----------------------------|
| 1 | ✅ Setup + reactivity | `<script setup>`, `ref`, `computed`, `watch`, `v-model`, `v-for`, `v-if`, `@event`, scoped CSS | `useState`, `useMemo`, `useEffect`, JSX |
| 2 | ✅ Components | `defineProps`, `defineEmits`, `defineModel`, slots, split `TaskItem` / `TaskForm` | props, callback props, `children` |
| 3 | ✅ Composables | `useTasks()`, `useLocalStorage()`, `reactive` vs `ref`, `toRefs`, lifecycle (`onMounted`) | custom hooks |
| 4 | ✅ Vue Router + Playground | routes, `<RouterLink>`, params (`/tasks/:id`), nested routes, lazy routes, navigation guards | App Router, `useParams`, `middleware.ts` |
| 5 | ✅ Pinia | store (setup style), getters, actions, `storeToRefs`, devtools | Zustand / Context |
| 6 | ✅ Forms + validation | `v-model` modifiers, validation (VeeValidate + Zod), error UI | react-hook-form + Zod |
| 7 | ✅ API calls | fetch in composable, loading/error states, abort, TanStack Query for Vue | `fetch` in Server Components, TanStack Query |
| 8 | ✅ Testing deep dive | component tests, Pinia testing, mocking fetch (MSW), router tests, coverage | same Vitest + RTL patterns |
| 9 | Production quality | env vars (`import.meta.env`), error handling, `provide/inject`, `Teleport`, `Suspense`, performance (`shallowRef`, `v-memo`, `KeepAlive`), a11y | `.env`, error boundaries, portals |
| 10 | Build & deploy | `vite build`, CI (lint + type-check + test), deploy to Vercel/Netlify, optional Nuxt intro (SSR) | `next build`, Vercel |

## Key mindset shift from React
- Vue **mutates** state (`tasks.value.push(x)`); React **replaces** it (`setTasks([...tasks, x])`).
- `setup` runs **once** per component; React's function body runs **every render**. So no stale closures and no dependency arrays.
- Templates compile to optimized render functions, so you rarely need `memo` / `useCallback`.

## Run
See [README.md](README.md#setup).
