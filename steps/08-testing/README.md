# Step 08 · Testing deep dive

Same app as step 07, plus one small fix. This step is about **tests you can trust**, across every layer.

| Layer | Files | Tool |
|-------|-------|------|
| Unit | `router/__tests__/routes.spec.ts`, `api/__tests__/queryClient.spec.ts`, `schemas/__tests__` | Vitest |
| Component | `components/__tests__`, `views/__tests__/BoardView.spec.ts` | Vue Test Utils + MSW |
| Integration (user style) | [`__tests__/board.user.spec.ts`](src/__tests__/board.user.spec.ts) | **Testing Library + user-event** + MSW |
| Integration (VTU style) | `__tests__/App.spec.ts` | Vue Test Utils + MSW |
| E2E | [`e2e/tasks.spec.ts`](e2e/tasks.spec.ts) | **Playwright** on the production build |

New test helpers in [`src/test/`](src/test):
```
render.ts     renderApp(url) → Testing Library render with Pinia + router + QueryClient, returns `user`
factories.ts  buildTask({ done: true }) / buildTasks(3)
mockApi.ts    seed / fail / networkError / hang / record (built on MSW server.use)
setup.ts      MSW server, jest-dom matchers, cleanup, db + localStorage reset
```

## What you learn
| Vue | React |
|-----|-------|
| `render(App, { global: { plugins } })` | `render(<App/>, { wrapper: Providers })` |
| `screen.getByRole`, `findBy*`, `queryBy*` | identical |
| `userEvent.setup()` + `user.type/click/tab` | identical |
| `@testing-library/jest-dom/vitest` | identical |
| VTU `wrapper.emitted()` / `getComponent(Stub).props()` | (no direct equivalent: RTL avoids internals) |
| `router.resolve(path).name` | test `matchRoutes` / middleware matcher |
| `vitest run --coverage` + `thresholds` | identical |
| Playwright `page.getByRole(...)` | identical |

## Key ideas
- **Query like a user:** role → label → text → `data-test` (last resort). If `getByRole` can't find it, a screen reader can't either.
- **Wait for the UI, not for time:** `findBy*` / `waitFor`. Never `setTimeout(500)`.
- **Mock the network, not your code:** MSW scenarios instead of `vi.mock('@tanstack/vue-query')`.
- **Test-first fix:** a failed optimistic toggle was undone silently. The test "rolls back a failed toggle and tells the user" came first, then `role="alert"` in `BoardView.vue`.
- **E2E found a real race:** optimistic UI checks the box before the server saves. Reload too early = change lost. The test now waits for the `PATCH` response.
- **Coverage shows what never ran, not what is correct.** Thresholds stop it from silently dropping.

## Try it
```bash
npm run test:08                              # unit + component + integration
npm run test:coverage -w steps/08-testing    # + coverage report (coverage/index.html)
npm run test:e2e:08                          # Playwright: builds, previews on :4178, runs e2e/
npx playwright test --ui                     # (in steps/08-testing) watch E2E step by step
```
First E2E run on your machine: `npx playwright install chromium`.

## Exercise
1. Rewrite `TaskEditor.spec.ts` with Testing Library. Which assertions became easier, which harder?
2. Add a `mockApi.slow(ms)` helper and a test that "syncing…" shows during a background refetch.
3. Add an E2E test for the unsaved-changes dialog (`page.on('dialog', d => d.dismiss())`).
4. Raise a coverage threshold by 2% and write the tests to meet it.
