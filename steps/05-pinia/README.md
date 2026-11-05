# Step 05 · Pinia (global state)

Step 04's known bug: every `useTasks()` call created its **own** state, so two components only agreed after a reload. Pinia gives you **one shared store** per app.

```
stores/tasks.ts       useTasksStore: step 03's useTasks(), wrapped in defineStore()
App.vue               header badge reads the store
views/BoardView.vue   reads and writes the same store
views/TaskDetailView  same store again, and the route guard uses it too
```
Proof: add a task on the board and watch the header badge change. Toggle a task on its detail page, go back, and the board is already updated.

## What you learn
| Pinia | React |
|-------|-------|
| `defineStore('tasks', () => { ... })` (setup store) | Zustand `create((set, get) => ({ ... }))` |
| `ref` = state, `computed` = getters, `function` = actions | state + selectors + actions |
| `useTasksStore()` anywhere, same instance | `useStore()` hook |
| `storeToRefs(store)` to destructure state/getters | selectors `useStore((s) => s.remaining)` |
| `store.$patch({...})`, `store.$reset()` | `set({...})` |
| `app.use(createPinia())` | `<Provider>` (Zustand needs none) |
| Vue DevTools → Pinia tab (time travel, edit state) | Redux DevTools |
| `setActivePinia(createPinia())` in tests | reset the store between tests |
| `createTestingPinia({ initialState, createSpy: vi.fn })` | mock the store / Context value |

## Rules to remember
```ts
const store = useTasksStore()
const { remaining } = store                 // ❌ plain value, never updates
const { remaining } = storeToRefs(store)    // ✅ Ref, stays reactive
const { addTask } = store                   // ✅ actions are plain functions
store.remaining                             // ✅ in script/template: no .value needed
```
- **Composable or store?** Use a composable for logic that each component should have its own copy of (`useOnline`, `useEventListener`). Use a store for data that the whole app shares (tasks, the current user, the cart).
- A setup store must **return all state**, or DevTools and SSR can't see it.
- Stores can use composables (`useLocalStorage` inside the store) and other stores.

## Testing: two levels
- **Store unit tests** ([`stores/__tests__/tasks.spec.ts`](src/stores/__tests__/tasks.spec.ts)): a real store with a fresh `createPinia()` per test.
- **Component tests** ([`views/__tests__/BoardView.spec.ts`](src/views/__tests__/BoardView.spec.ts)): `createTestingPinia` sets the state and turns actions into `vi.fn()` spies. The test checks "the view calls `addTask('Spy me')`", not the store logic.

## Playground
Now hosted here, with step 04 added (its board view, because step 04's `App.vue` is only a router shell). `tsconfig.app.json` `paths` falls back to `../04-router/src` so TypeScript finds files that only exist in older steps.

## Try it
```bash
npm run dev        # → /playground now includes 04
npm run dev:05
npm run test:05
```

## Exercise
1. Add a `useUiStore` with `theme: 'light' | 'dark'`, and toggle it from the header.
2. Use `store.$subscribe((mutation, state) => ...)` instead of `useLocalStorage` to persist. Which approach do you prefer, and why?
3. Write an **options store** version (`state`, `getters`, `actions`) of `useTasksStore` and compare it with the setup version.
