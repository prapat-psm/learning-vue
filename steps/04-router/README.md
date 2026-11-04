# Step 04 · Vue Router + Playground

The Task Board becomes a multi-page app, and a **Playground** shows every earlier step in one website.

```
/                 BoardView           (step 03's App.vue, moved)
/tasks/:id        TaskDetailView      lazy, typed prop, beforeEnter guard → 404
/playground       PlaygroundLayout    nested routes, lazy
  ├── ''          PlaygroundHome
  ├── 01 | 02 | 03  the real App.vue of steps/01-03, imported from their folders
/:pathMatch(.*)*  NotFoundView        catch-all
```
Files: [`src/router/routes.ts`](src/router/routes.ts), [`src/router/index.ts`](src/router/index.ts), [`src/views`](src/views), [`src/playground`](src/playground).

## What you learn
| Vue Router | Next.js App Router |
|------------|--------------------|
| routes listed in `routes.ts` | folders in `app/` (file-based) |
| `App.vue` with `<RouterView />` | `app/layout.tsx` with `{children}` |
| `children: [...]` + nested `<RouterView />` | nested `layout.tsx` |
| `path: '/tasks/:id(\\d+)'` | `app/tasks/[id]/page.tsx` |
| `props: (r) => ({ id: Number(r.params.id) })` | `params` prop on the page |
| `component: () => import('...')` | automatic code splitting / `next/dynamic` |
| `<RouterLink :to="{ name: 'task', params }">` | `<Link href={...}>` |
| `useRouter().push()`, `useRoute()` | `useRouter()`, `usePathname()`, `useParams()` |
| `beforeEnter` / `router.beforeEach` | `notFound()` / `middleware.ts` |
| `/:pathMatch(.*)*` | `not-found.tsx` |
| `meta: { title }` + `afterEach` | `export const metadata` |

## Things that bite React devs
- **Same route, new param → component is reused.** `/tasks/1` → `/tasks/2` does not remount. Derive everything from props with `computed` (see `TaskDetailView.vue`), or `watch(() => props.id, ...)`.
- **Use named routes** (`{ name: 'task', params: { id } }`) instead of string paths. Renaming a URL then touches only `routes.ts`.
- **Client-side only.** Vue Router has no server components or SSR here. For that, see Nuxt (step 10).

## How the Playground works
`src/playground/steps.ts` imports `../../../01-reactivity/src/App.vue` with `import()`, so each step is a lazy chunk. Inside step 02/03, `@/types` must mean *their* `src`, so [`vite.config.ts`](vite.config.ts) has a 15-line plugin, `stepAwareAlias`, that resolves `@/` from the importing file's step folder.

Known gotcha (on purpose): step 03 in the Playground and the step 04 Board both use `useTasks()` with the same localStorage key, but each `useTasks()` call has its **own** in-memory state. They only agree after a reload. Step 05 (Pinia) fixes this with one shared store.

## Testing with a router
- Unit tests: `global: { stubs: { RouterLink: RouterLinkStub } }` (see `TaskItem.spec.ts`).
- Integration: [`src/test/mountApp.ts`](src/test/mountApp.ts) creates a real router with `createMemoryHistory()`, then waits for `router.isReady()`. Clicks navigate asynchronously, so use `vi.waitFor`.

## Try it
```bash
npm run dev:04     # http://localhost:5173/playground
npm run test:04
```

## Exercise
1. Add `/tasks/:id/edit` as a **child** of the task route, with the title in an input.
2. Add a global `beforeEach` that blocks leaving the edit page when there are unsaved changes (`return false`).
3. Keep the board filter in the URL: `/?filter=done` (read `route.query`, write with `router.replace`).
