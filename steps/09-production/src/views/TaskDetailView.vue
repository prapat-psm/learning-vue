<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'
import { useRemoveTask, useToggleTask } from '@/queries/tasks'
import { ApiError } from '@/api/http'
import type { Task } from '@/types'
import { useToast } from '@/plugins/toast'

/**
 * This page uses the HAND-ROLLED useFetch on purpose, to compare with TanStack Query:
 * - every visit shows "Loading…" again (no cache)
 * - after a change we must call refetch() ourselves (no invalidation)
 * The board, new and edit pages use TanStack Query. In a real app, pick one: Query.
 */
const props = defineProps<{ id: number }>()
const router = useRouter()
const toast = useToast()

// Getter → when /tasks/1 → /tasks/2 reuses this component, useFetch aborts and refetches
const { data: task, error, isLoading, refetch } = useFetch<Task>(() => `/tasks/${props.id}`)

const { mutateAsync: toggleTask, isPending: isToggling } = useToggleTask()
const { mutateAsync: removeTask } = useRemoveTask()

async function toggle(t: Task) {
  await toggleTask(t)
  await refetch() // manual sync: the Query cache was invalidated, but useFetch knows nothing about it
}

async function remove() {
  await removeTask(props.id)
  toast.show('Task deleted')
  await router.push({ name: 'board' })
}
</script>

<template>
  <RouterLink :to="{ name: 'board' }">← Back</RouterLink>

  <p v-if="isLoading && !task" role="status" data-test="loading">Loading task…</p>

  <div v-else-if="error" role="alert" data-test="load-error">
    <template v-if="error instanceof ApiError && error.status === 404">
      <h1>404</h1>
      <p>Task {{ id }} does not exist.</p>
    </template>
    <template v-else>
      <p>Could not load the task: {{ error.message }}</p>
      <button type="button" @click="refetch">Retry</button>
    </template>
  </div>

  <article v-else-if="task">
    <h1>{{ task.title }}</h1>
    <p data-test="status">Status: {{ task.done ? 'Done' : 'Active' }}</p>
    <dl>
      <dt>Priority</dt>
      <dd data-test="priority">{{ task.priority ?? 'medium' }}</dd>
      <dt>Due</dt>
      <dd data-test="due">{{ task.dueDate ?? '—' }}</dd>
    </dl>
    <p v-if="task.description" data-test="description" class="description">
      {{ task.description }}
    </p>
    <RouterLink :to="{ name: 'task-edit', params: { id: task.id } }">Edit</RouterLink>
    <button type="button" :disabled="isToggling" @click="toggle(task)">
      Mark as {{ task.done ? 'active' : 'done' }}
    </button>
    <button type="button" @click="remove">Delete</button>
  </article>
</template>

<style scoped>
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
}
dd {
  margin: 0;
}
.description {
  white-space: pre-line;
}
</style>
