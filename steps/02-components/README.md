# Step 02 · Components

Step 01's `App.vue` split into components. Same behavior, same tests pass.

```
App.vue            owns state (tasks), handles add/toggle/remove
├── TaskForm.vue   local draft state, emits `add`
│   └── BaseInput.vue   custom v-model via defineModel()
└── TaskList.vue   props: tasks, re-emits events, #empty slot
    └── TaskItem.vue    props: task, emits toggle / remove
```

## What you learn
| Vue | React / Next.js |
|-----|-----------------|
| `defineProps<{ task: Task }>()` | `function TaskItem({ task }: Props)` |
| `defineEmits<{ remove: [id: number] }>()` + `emit('remove', id)` | `onRemove: (id: number) => void` prop |
| `@remove="removeTask"` in parent | `onRemove={removeTask}` |
| `defineModel<string>()` + `v-model` on a component | `value` + `onChange` props pair |
| `<slot name="empty">fallback</slot>` + `<template #empty>` | `empty?: ReactNode` prop, `children` |
| `findAllComponents(TaskItem)`, `emitted('remove')` | RTL + `vi.fn()` callbacks |

## Rules to remember
- **Props down, events up.** Never mutate a prop (`props.task.done = true` is a bug and ESLint warns).
- Keep state in the lowest common parent (here `App`). Step 05 moves it into Pinia.
- Name events as past-tense or verbs (`add`, `remove`), not `onAdd`. Vue adds the `on` prefix for you.
- `defineModel` is only for genuine two-way inputs. For actions, use emits.

## Try it
```bash
npm run dev:02
npm run test:02
```

## Exercise
1. Add an `edit` event to `TaskItem` (double-click the title to rename).
2. Turn `TaskList` into a **scoped slot**: `<slot name="item" :task="task">` so the parent can render a custom row. (React: render props.)
3. Add a `TaskFilter.vue` that uses `defineModel<'all' | 'active' | 'done'>()`.
