<script setup lang="ts">
import { useRouter } from 'vue-router'
import TaskEditor from '@/components/TaskEditor.vue'
import { useTasksStore } from '@/stores/tasks'
import type { TaskInput } from '@/schemas/task'

const router = useRouter()
const store = useTasksStore()

async function create(
  values: TaskInput,
  { setFieldError }: { setFieldError: (f: keyof TaskInput, m: string) => void },
) {
  // Rule only the "server" (store) knows → push the error back into the form
  if (store.isTitleTaken(values.title)) {
    setFieldError('title', 'A task with this title already exists')
    return
  }
  const task = store.createTask(values)
  await router.push({ name: 'task', params: { id: task.id } })
}
</script>

<template>
  <h1>New task</h1>
  <TaskEditor submit-label="Create" @submit="create" @cancel="router.push({ name: 'board' })" />
</template>
