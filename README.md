# learning-vue

Learn Vue 3 from basics to production by building one **Task Board** app.
Each step is a separate, runnable folder in [`steps/`](steps), and every step builds on the one before.
See the full plan in [ROADMAP.md](ROADMAP.md).

| Step | Folder | Topic |
|------|--------|-------|
| 01 | [steps/01-reactivity](steps/01-reactivity) | `ref`, `computed`, `watch`, template syntax |
| 02 | [steps/02-components](steps/02-components) | props, emits, `defineModel`, slots |
| 03 | [steps/03-composables](steps/03-composables) | composables, lifecycle, `watch` deep, localStorage |
| 04 | [steps/04-router](steps/04-router) | Vue Router, nested + lazy routes, guards, **Playground with every step** |
| 05 | coming | Pinia |

## Setup
```bash
npx npm@11 install     # one install for all steps (npm workspaces). npm 10.9 crashes, use 11+ or pnpm
npm run dev            # Playground: every step in one site → http://localhost:5173/playground
npm run dev:02         # run one step on its own
npm run test:02        # test a step
npm test               # test every step
```

Stack: Vue 3.5 · Vite · TypeScript · Vitest · Vue Test Utils · ESLint + oxlint · Prettier
