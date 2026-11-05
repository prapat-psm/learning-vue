<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { taskSchema, today, type TaskInput } from '@/schemas/task'

/**
 * STEP 06 part 2: a real form with VeeValidate + Zod.
 * React mapping (react-hook-form):
 *   useForm({ validationSchema })   ≈ useForm({ resolver: zodResolver(schema) })
 *   defineField('title')            ≈ register('title')
 *   errors.title                    ≈ formState.errors.title?.message
 *   handleSubmit(fn)                ≈ handleSubmit(fn)
 *   meta.dirty                      ≈ formState.isDirty
 *   setFieldError('title', msg)     ≈ setError('title', { message })
 */
const props = withDefaults(
  defineProps<{ initialValues?: Partial<TaskInput>; submitLabel?: string }>(),
  { initialValues: () => ({}), submitLabel: 'Save' },
)

const emit = defineEmits<{
  // Parent gets typed values + a way to report server-side errors back into the form
  submit: [
    values: TaskInput,
    helpers: { setFieldError: (field: keyof TaskInput, msg: string) => void },
  ]
  cancel: []
}>()

// v-model:dirty → the parent can block navigation while there are unsaved changes
const dirty = defineModel<boolean>('dirty', { default: false })

const { defineField, errors, handleSubmit, meta, isSubmitting, setFieldError, resetForm } = useForm(
  {
    validationSchema: toTypedSchema(taskSchema),
    initialValues: { title: '', priority: 'medium', description: '', ...props.initialValues },
  },
)

// defineField returns [v-model value, extra attrs (blur handler etc.)]
// validateOnModelUpdate: false → don't shout while typing; validate on blur/change instead
const fieldOptions = { validateOnModelUpdate: false }
const [title, titleAttrs] = defineField('title', fieldOptions)
const [description, descriptionAttrs] = defineField('description', fieldOptions)
const [priority, priorityAttrs] = defineField('priority', fieldOptions)
const [dueDate, dueDateAttrs] = defineField('dueDate', fieldOptions)

watch(
  () => meta.value.dirty,
  (value) => (dirty.value = value),
  { immediate: true },
)

// handleSubmit validates everything first; the callback only runs with valid, typed values
const onSubmit = handleSubmit((values) => {
  emit('submit', values, { setFieldError })
})

// Let the parent mark the current values as saved (clears dirty)
defineExpose({ markSaved: (values: TaskInput) => resetForm({ values }) })
</script>

<template>
  <form novalidate class="editor" @submit.prevent="onSubmit">
    <label>
      Title
      <input
        v-model="title"
        v-bind="titleAttrs"
        name="title"
        :aria-invalid="!!errors.title"
        aria-describedby="title-error"
      />
    </label>
    <p v-if="errors.title" id="title-error" role="alert" class="error">{{ errors.title }}</p>

    <label>
      Description
      <!-- .lazy would sync on change instead of input; trimming is done by the schema -->
      <textarea
        v-model="description"
        v-bind="descriptionAttrs"
        name="description"
        rows="3"
        :aria-invalid="!!errors.description"
      />
    </label>
    <p v-if="errors.description" role="alert" class="error">{{ errors.description }}</p>

    <label>
      Priority
      <select v-model="priority" v-bind="priorityAttrs" name="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
    <p v-if="errors.priority" role="alert" class="error">{{ errors.priority }}</p>

    <label>
      Due date
      <input
        v-model="dueDate"
        v-bind="dueDateAttrs"
        type="date"
        name="dueDate"
        :min="today()"
        :aria-invalid="!!errors.dueDate"
      />
    </label>
    <p v-if="errors.dueDate" role="alert" class="error">{{ errors.dueDate }}</p>

    <div class="actions">
      <button type="submit" :disabled="isSubmitting">{{ submitLabel }}</button>
      <button type="button" @click="emit('cancel')">Cancel</button>
      <span v-if="meta.dirty" class="hint" data-test="dirty">Unsaved changes</span>
    </div>
  </form>
</template>

<style scoped>
.editor {
  display: grid;
  gap: 0.5rem;
}
label {
  display: grid;
  gap: 0.25rem;
}
input,
textarea,
select {
  padding: 0.4rem;
  font: inherit;
}
.error {
  margin: 0;
  color: #c0392b;
  font-size: 0.9em;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.hint {
  color: #888;
  font-size: 0.9em;
}
</style>
