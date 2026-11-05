<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskEditor from '@/components/TaskEditor.vue'
import { useCreateTask } from '@/queries/tasks'
import { applyServerErrors } from '@/api/formErrors'
import type { TaskInput } from '@/schemas/task'
import { useToast } from '@/plugins/toast'

const router = useRouter()
const toast = useToast()
const { mutateAsync: createTask } = useCreateTask()
const formError = ref('')

async function create(
  values: TaskInput,
  { setFieldError }: { setFieldError: (f: keyof TaskInput, m: string) => void },
) {
  formError.value = ''
  try {
    // mutateAsync returns a Promise (throws on error). mutate() is fire-and-forget.
    const task = await createTask(values)
    toast.show(`Created “${task.title}”`)
    await router.push({ name: 'task', params: { id: task.id } })
  } catch (e) {
    // The server is the source of truth: 422 → field errors, anything else → a general message
    if (!applyServerErrors(e, setFieldError)) formError.value = (e as Error).message
  }
}
</script>

<template>
  <h1>New task</h1>
  <p v-if="formError" role="alert" class="error">{{ formError }}</p>
  <TaskEditor submit-label="Create" @submit="create" @cancel="router.push({ name: 'board' })" />
</template>

<style scoped>
.error {
  color: #c0392b;
}
</style>
