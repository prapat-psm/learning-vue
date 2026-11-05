<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import TaskEditor from '@/components/TaskEditor.vue'
import { useTaskQuery, useUpdateTask } from '@/queries/tasks'
import { applyServerErrors } from '@/api/formErrors'
import { ApiError } from '@/api/http'
import type { TaskInput } from '@/schemas/task'
import { useToast } from '@/plugins/toast'
import { useConfirm } from '@/plugins/confirm'

const props = defineProps<{ id: number }>()
const router = useRouter()
const toast = useToast() // ≈ useContext(ToastContext)
const confirm = useConfirm()

// Getter → the query key follows the prop
const { data: task, isPending, error } = useTaskQuery(() => props.id)
const { mutateAsync: updateTask } = useUpdateTask()

const initialValues = computed(() => {
  const t = task.value
  return t
    ? {
        title: t.title,
        description: t.description ?? '',
        priority: t.priority ?? 'medium',
        dueDate: t.dueDate,
      }
    : {}
})

const dirty = ref(false)
const formError = ref('')
const editor = useTemplateRef('editor')

async function save(
  values: TaskInput,
  { setFieldError }: { setFieldError: (f: keyof TaskInput, m: string) => void },
) {
  formError.value = ''
  try {
    await updateTask({ id: props.id, patch: values })
    editor.value?.markSaved(values) // clears dirty so the leave-guard won't ask
    toast.show('Changes saved')
    await router.push({ name: 'task', params: { id: props.id } })
  } catch (e) {
    if (!applyServerErrors(e, setFieldError)) formError.value = (e as Error).message
  }
}

// Step 09: guards can be async. The router waits for our in-app dialog instead of window.confirm()
onBeforeRouteLeave(async () => {
  if (!dirty.value) return
  const discard = await confirm.ask('Discard unsaved changes?', {
    confirm: 'Discard',
    cancel: 'Keep editing',
  })
  if (!discard) return false
})
</script>

<template>
  <h1>Edit task</h1>
  <p v-if="isPending" role="status" data-test="loading">Loading task…</p>
  <p v-else-if="error" role="alert" data-test="load-error">
    {{
      error instanceof ApiError && error.status === 404
        ? `Task ${id} does not exist.`
        : error.message
    }}
  </p>
  <template v-else-if="task">
    <p v-if="formError" role="alert" class="error">{{ formError }}</p>
    <!-- Render the form only AFTER data arrived: initialValues are read once, on mount -->
    <TaskEditor
      ref="editor"
      :key="id"
      v-model:dirty="dirty"
      :initial-values="initialValues"
      @submit="save"
      @cancel="router.push({ name: 'task', params: { id } })"
    />
  </template>
</template>

<style scoped>
.error {
  color: #c0392b;
}
</style>
