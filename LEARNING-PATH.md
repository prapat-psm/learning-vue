# Vue.js Learning Path: from zero to production

A study order for a React/Next.js developer learning Vue 3. Each step has a runnable folder in [`steps/`](steps) and a README.
Mini project: **Task Board**, one app that grows each step.

**How to study each step (about 1 to 3 hours)**
1. Read the step's `README.md`, starting with the Vue ↔ React table.
2. Run it: `npm run dev:NN`. Change code and watch the page update.
3. Read the tests: `npm run test:NN`, or `npx vitest` inside the folder for watch mode.
4. Do the 3 exercises at the end of the README. Write the test first.
5. Compare with the previous step: `git diff --no-index steps/0X-a/src steps/0Y-b/src`

Setup (once): `npx npm@11 install` · Playground with every step: `npm run dev` → `/playground`

Legend: ✅ done · ⏳ coming next

---

## Phase 1 · Foundations

### ✅ Step 01 · Reactivity basics · `steps/01-reactivity`
- `<script setup>`, `ref`, `computed`, `watch`
- Template syntax: `{{ }}`, `v-if/v-else`, `v-for` + `:key`, `v-model`, `@event.prevent`, `:class`
- `<style scoped>`
- **Key idea:** `setup` runs **once**. You mutate state and Vue tracks it, so there are no dependency arrays.
- React: `useState` → `ref`, `useMemo` → `computed`, `useEffect` → `watch`

### ✅ Step 02 · Components · `steps/02-components`
- `defineProps`, `defineEmits`, `defineModel` (custom `v-model`)
- Slots: default, named (`#empty`), fallback content
- **Key idea:** props down, events up. Never mutate props.
- Testing: `mount`, `setProps`, `emitted()`
- React: callback props → emits, `children`/ReactNode props → slots

### ✅ Step 03 · Composables · `steps/03-composables`
- `useTasks`, `useLocalStorage`, `useEventListener`, `useOnline`
- Lifecycle: `onMounted`, `onUnmounted`; `watch(..., { deep: true })`; `readonly`
- `ref` vs `reactive`, `toRefs`, why to return refs from composables
- Testing a composable: call it directly, or use `withSetup` (≈ `renderHook`)
- Bug lesson: `ref(initial)` shares the object, so use `structuredClone`
- React: custom hooks, without the rules of hooks

## Phase 2 · Building a real app

### ✅ Step 04 · Vue Router + Playground · `steps/04-router`
- Routes config, `<RouterView>`, `<RouterLink>`, named routes
- Params `/tasks/:id(\\d+)`, a `props` function, lazy routes `() => import()`
- Nested routes (layouts), catch-all 404, `meta` + `afterEach`
- Guards: `beforeEnter`, `beforeEach`
- Gotcha: same route with a new param **reuses** the component
- Testing: `createMemoryHistory`, `RouterLinkStub`, `vi.waitFor`
- Next.js: `app/` folders → `routes.ts`, `layout.tsx` → nested `RouterView`, `notFound()` → guard

### ✅ Step 05 · Pinia · `steps/05-pinia`
- `defineStore` (setup style): state, getters, actions
- `storeToRefs` (and why plain destructuring breaks)
- Stores outside components (route guards), `$patch`, `$reset`, HMR
- Composable vs store: per-component vs app-wide state
- Testing: `setActivePinia(createPinia())`, `createTestingPinia({ createSpy: vi.fn })`
- React: Zustand / Context + reducer

### ✅ Step 06 · Forms + validation · `steps/06-forms`
- `v-model` modifiers (`.trim`, `.number`, `.lazy`), `<select>`, checkbox, date inputs
- Hand-rolled validation with `computed` errors, then the same form with **VeeValidate + Zod**
- `useForm`, `defineField`, `handleSubmit`, touched/dirty state, server-side errors
- One Zod schema for types (`z.infer`) and validation
- Create and edit pages: `/tasks/new`, `/tasks/:id/edit`
- Server-side errors back into a field (`setFieldError`), unsaved-changes leave guard
- React: react-hook-form + zod

### ⏳ Step 07 · API calls
- `fetch` in a composable: loading, error, and abort with `AbortController`
- A mock REST API (json-server or MSW)
- **TanStack Query for Vue**: `useQuery`, `useMutation`, cache invalidation, optimistic update
- Server state (Query) vs client state (Pinia)
- React: TanStack Query (same API) / Server Components data fetching

## Phase 3 · Production quality

### ⏳ Step 08 · Testing deep dive
- Test pyramid: unit (composables/stores) → component → integration (router + pinia)
- MSW for API mocking in Vitest, coverage with `vitest --coverage`
- E2E with Playwright: critical flows only
- Accessible queries (`@testing-library/vue`) vs Vue Test Utils

### ⏳ Step 09 · Production patterns
- `import.meta.env` and `.env` files, typed env
- Error handling: `app.config.errorHandler`, `onErrorCaptured` (≈ error boundary)
- `provide/inject` (≈ Context), `<Teleport>` (≈ portal), `<Suspense>`, `<KeepAlive>`
- Performance: `shallowRef`, `v-memo`, `v-once`, async components, bundle analysis
- Accessibility: focus management on route change, live regions

### ⏳ Step 10 · Build & deploy
- `vite build`, preview, base URL, SPA fallback
- CI with GitHub Actions: lint → type-check → test → build
- Deploy to Vercel or Netlify, with a preview deploy per PR
- Intro to **Nuxt** (SSR/SSG, file-based routing) ≈ Next.js for Vue

---

## Cheat sheet: React → Vue

| React / Next.js | Vue 3 |
|-----------------|-------|
| `useState` | `ref` |
| `useMemo` | `computed` |
| `useEffect(fn, [x])` | `watch(x, fn)` / `watchEffect` |
| `useEffect(fn, [])` + cleanup | `onMounted` + `onUnmounted` |
| `useRef` (DOM) | `useTemplateRef('el')` |
| custom hook | composable |
| props + callback props | `defineProps` + `defineEmits` |
| `value` + `onChange` | `v-model` / `defineModel` |
| `children`, render props | default slot, scoped slots |
| Context | `provide` / `inject`, or Pinia |
| Zustand | Pinia |
| `{cond && <A/>}` | `v-if` |
| `list.map(...)` | `v-for` + `:key` |
| `className={clsx(...)}` | `:class="{ ... }"` |
| CSS Modules | `<style scoped>` |
| `<Link>`, `useRouter` | `<RouterLink>`, `useRouter` |
| `layout.tsx` + `{children}` | nested route + `<RouterView>` |
| react-hook-form + zod | VeeValidate + zod |
| RTL `render`, `renderHook` | VTU `mount`, `withSetup` |
| Next.js | Nuxt |

## Links
- Vue docs: https://vuejs.org/guide/introduction.html (use the "Composition API" toggle)
- Vue Router: https://router.vuejs.org · Pinia: https://pinia.vuejs.org
- VeeValidate: https://vee-validate.logaretm.com/v4/ · TanStack Query Vue: https://tanstack.com/query/latest/docs/framework/vue/overview
- Vue Test Utils: https://test-utils.vuejs.org · Nuxt: https://nuxt.com
