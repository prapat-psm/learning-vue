<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'

// The id arrives as a typed prop (see `props` in routes.ts), not via useRoute().
// ≈ Next.js page receiving { params } instead of reading the URL itself. Easier to test.
const props = defineProps<{ id: number }>()

const router = useRouter() // ≈ useRouter() from next/navigation
const store = useTasksStore() // same instance the board and header use

// computed on props.id: if you go /tasks/1 → /tasks/2 Vue REUSES this component,
// so anything not derived from props.id would show stale data.
const task = computed(() => store.byId(props.id)) // store.x works without .value in script

async function remove() {
  store.removeTask(props.id)
  await router.push({ name: 'board' }) // ≈ router.push('/')
}
</script>

<template>
  <article v-if="task">
    <RouterLink :to="{ name: 'board' }">← Back</RouterLink>
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
    <button type="button" @click="store.toggleTask(task.id)">
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
