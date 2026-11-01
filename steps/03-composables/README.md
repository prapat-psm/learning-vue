# Step 03 · Composables

All logic moves out of `App.vue` into **composables** in [`src/composables`](src/composables). `App.vue` is now just wiring.

```
composables/
├── useLocalStorage.ts   ref that persists (watch deep)
├── useTasks.ts          state + computed + actions (built on useLocalStorage)
├── useEventListener.ts  onMounted / onUnmounted cleanup
└── useOnline.ts         built on useEventListener → "You are offline" banner
components/TaskFilter.vue  (step 02 exercise, done with defineModel)
test/withSetup.ts          renderHook() for Vue
```

## What you learn
| Vue | React / Next.js |
|-----|-----------------|
| `function useTasks() { const x = ref(); return { x } }` | custom hook `useTasks()` |
| called **once** in `setup` | called **every render**, rules of hooks apply |
| `onMounted(fn)` / `onUnmounted(fn)` | `useEffect(fn, [])` + its cleanup return |
| `watch(state, fn, { deep: true })` | `useEffect(fn, [state])` (only on a new reference) |
| `readonly(ref)` | not built in (you'd expose only the setter you want) |
| `withSetup(() => useOnline())` in tests | `renderHook(() => useOnline())` |
| test `useTasks()` with no mount at all | hooks always need `renderHook` |

## `ref` vs `reactive`
```ts
const count = ref(0)                 // any type, use .value in script
const form = reactive({ a: 1, b: 2 }) // objects only, no .value

const { a } = form           // ❌ a is a plain number, reactivity lost
const { a } = toRefs(form)   // ✅ a is Ref<number>
```
**Rule of thumb:** use `ref` everywhere and return refs from composables. Then callers can destructure safely.

## Bug we hit (and the regression test)
`useLocalStorage(key, DEFAULT_TASKS)` first did `ref(initial)`. `ref` wraps the **same** array, so `addTask` pushed into `DEFAULT_TASKS` itself and the next `useTasks()` started with 3 tasks. Fix: `structuredClone(initial)`. In React the same bug happens if you mutate the initial state object.

## Try it
```bash
npm run dev:03     # add tasks, reload: still there. DevTools → Network → Offline: banner shows
npm run test:03
```

## Exercise
1. Write `useDebouncedRef(value, ms)` and use it for a search box that filters tasks by title.
2. Make `useEventListener` accept any `EventTarget` (e.g. `document`) and test it with `withSetup`.
3. Sync tasks between two browser tabs: listen to the `storage` event in `useLocalStorage`.
