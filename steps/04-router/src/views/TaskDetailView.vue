<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTasks } from '@/composables/useTasks'

// The id arrives as a typed prop (see `props` in routes.ts), not via useRoute().
// ≈ Next.js page receiving { params } instead of reading the URL itself. Easier to test.
const props = defineProps<{ id: number }>()

const router = useRouter() // ≈ useRouter() from next/navigation
const { tasks, toggleTask, removeTask } = useTasks()

// computed on props.id: if you go /tasks/1 → /tasks/2 Vue REUSES this component,
// so anything not derived from props.id would show stale data.
const task = computed(() => tasks.value.find((t) => t.id === props.id))

async function remove() {
  removeTask(props.id)
  await router.push({ name: 'board' }) // ≈ router.push('/')
}
</script>

<template>
  <article v-if="task">
    <RouterLink :to="{ name: 'board' }">← Back</RouterLink>
    <h1>{{ task.title }}</h1>
    <p data-test="status">Status: {{ task.done ? 'Done' : 'Active' }}</p>
    <button type="button" @click="toggleTask(task.id)">
      Mark as {{ task.done ? 'active' : 'done' }}
    </button>
    <button type="button" @click="remove">Delete</button>
  </article>
</template>
