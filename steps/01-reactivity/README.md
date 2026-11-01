# Step 01 · Reactivity basics

Everything lives in one file: [`src/App.vue`](src/App.vue).

## What you learn
| Vue | React / Next.js |
|-----|-----------------|
| `ref(0)` → read/write `.value` | `useState(0)` + setter |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` with no deps array |
| `watch(source, cb)` | `useEffect(cb, [source])` |
| `v-model="x"` | `value={x} onChange={e => setX(e.target.value)}` |
| `v-for="t in list" :key="t.id"` | `list.map(t => <li key={t.id} />)` |
| `v-if / v-else` | `{cond ? a : b}` |
| `@submit.prevent="fn"` | `onSubmit={e => { e.preventDefault(); fn() }}` |
| `:class="{ done: t.done }"` | `className={clsx({ done: t.done })}` |
| `<style scoped>` | CSS Modules |

## Key idea
`<script setup>` runs **once**, not on every render. Vue tracks which `ref`s you read, then re-renders only what depends on them. That's why you mutate (`tasks.value.push(x)`) and there are no dependency arrays.

## Try it
```bash
npm run dev:01
npm run test:01
```

## Exercise
1. Add a "Clear completed" button.
2. Add a filter (`all | active | done`) with a `ref` + `computed`.
3. Write a test for each one.
