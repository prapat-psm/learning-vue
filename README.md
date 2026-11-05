# learning-vue

Learn Vue 3 from basics to production by building one **Task Board** app.
Each step is a separate, runnable folder in [`steps/`](steps), and every step builds on the one before.
See the full plan in [ROADMAP.md](ROADMAP.md) and the study order in [LEARNING-PATH.md](LEARNING-PATH.md).

| Step | Folder | Topic |
|------|--------|-------|
| 01 | [steps/01-reactivity](steps/01-reactivity) | `ref`, `computed`, `watch`, template syntax |
| 02 | [steps/02-components](steps/02-components) | props, emits, `defineModel`, slots |
| 03 | [steps/03-composables](steps/03-composables) | composables, lifecycle, `watch` deep, localStorage |
| 04 | [steps/04-router](steps/04-router) | Vue Router, nested + lazy routes, guards, **Playground with every step** |
| 05 | [steps/05-pinia](steps/05-pinia) | Pinia store, `storeToRefs`, shared state, `createTestingPinia` |
| 06 | [steps/06-forms](steps/06-forms) | forms, hand-rolled vs VeeValidate + Zod, edit/new pages, leave guard |
| 07 | [steps/07-api](steps/07-api) | fetch wrapper, hand-rolled `useFetch` + abort, MSW mock API, TanStack Query, optimistic updates |
| 08 | [steps/08-testing](steps/08-testing) | Testing Library + user-event, factories, MSW scenarios, coverage thresholds, Playwright E2E |
| 09 | coming | Production patterns |

## Setup
```bash
npx npm@11 install     # one install for all steps (npm workspaces). npm 10.9 crashes, use 11+ or pnpm
npm run dev            # newest step (08) + Playground with every step → http://localhost:5173/playground
npm run dev:02         # run one step on its own
npm run test:02        # test a step
npm test               # test every step
npm run test:e2e:08    # Playwright E2E on the production build (step 08)
```

Stack: Vue 3.5 · Vite · TypeScript · Vitest · Vue Test Utils · ESLint + oxlint · Prettier
