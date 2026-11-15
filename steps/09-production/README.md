# Step 09 · Production patterns

Things every real app needs and most tutorials skip.

```
src/config.ts                      env vars validated with Zod at startup (+ .env.example)
src/lib/logger.ts                  one place for error reports (Sentry would plug in here)
src/plugins/errorHandling.ts       app.config.errorHandler + window 'unhandledrejection'
src/plugins/toast.ts               toast service: plugin + provide/inject + InjectionKey
src/plugins/confirm.ts             Promise-based confirm() service
src/plugins/index.ts               appPlugins(): same set for main.ts and the test helpers
src/components/app/ToastHost.vue   <Teleport> + aria-live region
src/components/app/ConfirmHost.vue <Teleport> + role="alertdialog", focus in/out, Esc
src/components/app/ErrorBoundary.vue onErrorCaptured fallback, resets on navigation
src/components/app/RouteAnnouncer.vue announce page title + focus <main> after navigation
src/views/CrashView.vue            /debug/error, throws on purpose
```
App.vue wraps `<RouterView>` in `<ErrorBoundary>` and keeps the board alive with `<KeepAlive include="BoardView">`. `TaskList` uses `v-memo`.

## What you learn
| Vue | React / Next.js |
|-----|-----------------|
| `import.meta.env.VITE_*` + Zod | `process.env.NEXT_PUBLIC_*` + `@t3-oss/env-nextjs` |
| `InjectionKey` + `app.provide` + `inject` | `createContext` + `Provider` + `useContext` |
| `<Teleport to="body">` | `createPortal(node, document.body)` |
| `onErrorCaptured` in `<ErrorBoundary>` | class Error Boundary / `react-error-boundary` |
| `app.config.errorHandler` | (none: root boundary + window listeners) |
| async `onBeforeRouteLeave` + in-app dialog | `useBlocker` + your dialog |
| `<KeepAlive>` + `onActivated` | (none built in) |
| `v-memo` | `React.memo` |
| route announcer (hand-written) | built into Next.js App Router |

## Key ideas
- **Fail fast on bad config.** A wrong env var throws at startup with every problem listed.
- **`VITE_*` is public.** It is in the bundle. Secrets belong on a server.
- **Services → plugin + inject, data → Pinia/Query.** Throw a clear error when the provider is missing.
- **Two layers of error handling:** a boundary per area (the page), a global handler for the rest. Everything goes to `logger`.
- **Dialogs are an a11y feature, not just a look:** role, label, focus in, Esc, focus back.
- **Cache only what is worth it** with KeepAlive. **Measure before memoizing** with v-memo.
- `<Suspense>` is still experimental in Vue 3.5. We use TanStack Query's `isPending` instead.

## Try it
```bash
npm run dev:09                       # then open /debug/error, edit a task and leave, create a task
cp steps/09-production/.env.example steps/09-production/.env.local   # try VITE_APP_TITLE=My Board
npm run test:09
npm run test:e2e:09
```

## Exercise
1. Add `toast.show(msg, 'error')` for failed mutations and remove the inline alert. Which tests change?
2. Trap Tab focus inside the dialog (Tab from the last button goes to the first).
3. Use `onActivated` in `BoardView` to refetch when you come back (and test it).
4. Make `/debug/error` exist only when `config.mode !== 'production'`.
