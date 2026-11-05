# Step 06 · Forms + validation

The same rule, built two ways:
1. **Hand-rolled** quick add on the board ([`TaskForm.vue`](src/components/TaskForm.vue)): a `ref`, a `computed` error, `role="alert"`
2. **VeeValidate + Zod** full form ([`TaskEditor.vue`](src/components/TaskEditor.vue)) used by `/tasks/new` and `/tasks/:id/edit`

Both use **one Zod schema** ([`schemas/task.ts`](src/schemas/task.ts)) for rules **and** the TypeScript type (`z.infer`).

```
/tasks/new            TaskNewView   create → open detail
/tasks/:id/edit       TaskEditView  edit, duplicate-title error, "Discard unsaved changes?" guard
/tasks/:id            TaskDetailView shows priority, due date, description + Edit link
```

## What you learn
| Vue | React |
|-----|-------|
| `v-model` on input/textarea/select/date | controlled inputs `value` + `onChange` |
| `v-model.trim` / `.number` / `.lazy` | manual `e.target.value.trim()` etc. |
| `useForm({ validationSchema: toTypedSchema(schema) })` | `useForm({ resolver: zodResolver(schema) })` |
| `const [title, titleAttrs] = defineField('title')` | `register('title')` |
| `errors.title` | `formState.errors.title?.message` |
| `handleSubmit((values) => ...)` | `handleSubmit((values) => ...)` |
| `meta.dirty`, `isSubmitting` | `formState.isDirty`, `isSubmitting` |
| `setFieldError('title', msg)` | `setError('title', { message })` |
| `resetForm({ values })` | `reset(values)` |
| `onBeforeRouteLeave(() => false)` | `useBlocker` / `beforeunload` |
| `useTemplateRef('editor')` + `defineExpose` | `useRef` + `useImperativeHandle` |

## UX rules used here (copy them into real projects)
- **Don't shout while typing.** Validate on blur/change, then show the error. Validate everything on submit.
- **Errors are accessible:** `aria-invalid`, `aria-describedby`, `role="alert"`.
- **Client rules live in the schema; server rules go back into the field.** The duplicate-title check is not in the schema (the schema can't know other tasks). The view checks it on submit and calls `setFieldError`, exactly like mapping an API 422 response.
- **Edit a draft, save on submit.** The form gets a copy (`initialValues`); the store changes only on Save.
- **Warn on unsaved changes** with a route-leave guard, and clear `dirty` after a successful save.

## Honest version note
`@vee-validate/zod` 4.15 supports **Zod 3** only, so this step pins `zod@3.25`. The schema code is the same in Zod 4.

## Testing forms
- Schema tests are pure functions. `vi.useFakeTimers({ now })` freezes "today" for the date rule.
- VeeValidate validates in a later macrotask (about 5 ms debounce), so tests `await settle()` ([`test/settle.ts`](src/test/settle.ts)) instead of only `flushPromises()`.
- `setValue()` fires `input` **and** `change`. To simulate typing only, set `element.value` and trigger `input`.
- `vi.spyOn(window, 'confirm')` tests the leave guard.

## Try it
```bash
npm run dev        # Playground now includes 05
npm run dev:06
npm run test:06
```

## Exercise
1. Add `tags` (comma-separated input → `string[]` with `z.preprocess` or `.transform`).
2. Make `dueDate` required when `priority === 'high'` (`.superRefine` on the object).
3. Disable **Save** until the form is dirty **and** valid (`meta.valid`), and test it.
