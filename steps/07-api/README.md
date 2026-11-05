# Step 07 · API calls + TanStack Query

The Task Board now talks to a **server** (a mock one, via MSW) instead of localStorage.
Two ways to fetch, side by side:

| Page | How it fetches | Why |
|------|----------------|-----|
| `/tasks/:id` | hand-rolled [`useFetch`](src/composables/useFetch.ts) | see what a library does for you |
| `/`, `/tasks/new`, `/tasks/:id/edit` | [TanStack Query](src/queries/tasks.ts) | what you use in production |

```
src/api/http.ts          fetch wrapper: throws ApiError on 4xx/5xx, JSON in/out
src/api/tasks.ts         tasksApi.list/get/create/update/remove
src/api/queryClient.ts   QueryClient defaults (staleTime, retry only 5xx/network)
src/api/formErrors.ts    422 fieldErrors → VeeValidate setFieldError
src/queries/tasks.ts     query keys, useTasksQuery, mutations, optimistic toggle/remove
src/mocks/               MSW handlers + fake db (browser: Service Worker, tests: Node)
src/stores/board.ts      Pinia now holds CLIENT state only (filter)
```

## What you learn
| Vue | React / Next.js |
|-----|-----------------|
| `useFetch(() => url)` with `watch` + `AbortController` | `useEffect(() => { ...; return () => c.abort() }, [url])` |
| `app.use(VueQueryPlugin, { queryClient })` | `<QueryClientProvider client={qc}>` |
| `useQuery({ queryKey, queryFn })` returns **refs** | same call, returns plain values |
| `queryKey: computed(() => ['tasks', id.value])` | `queryKey: ['tasks', id]` (re-render does it) |
| `useMutation` + `invalidateQueries` | same; ≈ `revalidatePath()` after a Server Action |
| `onMutate` / `onError` rollback | same, or React 19 `useOptimistic` |
| MSW `http.get('*/api/tasks', ...)` | MSW, or a Route Handler `app/api/tasks/route.ts` |
| `import.meta.env.VITE_API_URL` | `process.env.NEXT_PUBLIC_API_URL` |

## Key ideas
- **Server state ≠ client state.** API data lives in the Query cache. Don't copy it into Pinia. Pinia keeps UI-only state (the filter). The old `tasks` store is gone.
- **Every async UI has 3 states:** loading, error (with Retry), data. `isPending` = no data yet. `isFetching` = background refresh while showing cached data.
- **`fetch` does not throw on 404/500.** The `http()` wrapper does.
- **Abort old requests** when inputs change, or a slow old response overwrites the new one.
- **The server is the source of truth for rules like "unique title":** it answers 422 + `fieldErrors`, the form shows them in the field.
- **No `taskExists` route guard anymore:** the router can't know without asking the server, so views render the API's 404.
- **Templates only unwrap top-level refs.** `const { error } = useCreateTask()` then `{{ error }}`, not `{{ create.error }}`.

## Testing with MSW
- [`src/test/setup.ts`](src/test/setup.ts) starts MSW for all tests and resets handlers + db after each test.
- Override per test: `server.use(http.get('*/api/tasks', () => HttpResponse.json({...}, { status: 500 }), { once: true }))`
- Fresh `QueryClient` per test with `retry: false` ([`mountApp.ts`](src/test/mountApp.ts)).
- Network is a macrotask: `await settle()` / `vi.waitFor`, not just `flushPromises()`.
- No `vi.mock` of `fetch` or of `useQuery`: we test the real code against a fake server.

## Try it
```bash
npm run dev        # → http://localhost:5173 (MSW logs nothing; open DevTools → Network to see /api calls)
npm run dev:07
npm run test:07
```
Data is saved in localStorage key `task-board:api-db` (the "server's database"). Clear it to reset.
Playground now includes step 06.

## Exercise
1. Add `refetchOnWindowFocus` behaviour you can see: change data in another tab, come back.
2. Make **Delete** on the board optimistic **and** show a toast with "Undo" (hint: delay the mutation).
3. Replace the detail page's `useFetch` with `useTaskQuery` and use `placeholderData` from the list cache, so it opens instantly.
4. Add a "Simulate errors" toggle: an MSW handler that returns 500 when `localStorage['api:fail']` is set.
