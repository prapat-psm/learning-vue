<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/board'
import {
  useClearCompleted,
  useCreateTask,
  useRemoveTask,
  useTasksQuery,
  useToggleTask,
} from '@/queries/tasks'
import { useOnline } from '@/composables/useOnline'
import { errorMessage } from '@/api/http'
import TaskForm from '@/components/TaskForm.vue'
import TaskList from '@/components/TaskList.vue'
import TaskFilter from '@/components/TaskFilter.vue'

// SERVER state: every field is a ref. ≈ const { data, isPending, ... } = useQuery(...) in React
const { data, isPending, isError, error, isFetching, refetch } = useTasksQuery()
const tasks = computed(() => data.value ?? [])

// CLIENT state: Pinia
const { filter } = storeToRefs(useBoardStore())

// Derived state stays a computed, exactly like before
const remaining = computed(() => tasks.value.filter((t) => !t.done).length)
const visibleTasks = computed(() => {
  if (filter.value === 'active') return tasks.value.filter((t) => !t.done)
  if (filter.value === 'done') return tasks.value.filter((t) => t.done)
  return tasks.value
})

// Mutations. Destructure: templates only auto-unwrap TOP-LEVEL refs (create.error would not work)
const { mutate: createTask, error: createError, reset: resetCreate } = useCreateTask()
const { mutate: toggleTask } = useToggleTask()
const { mutate: removeTask } = useRemoveTask()
const { mutate: clearCompleted, isPending: isClearing } = useClearCompleted()

function addTask(title: string) {
  resetCreate()
  createTask({ title, description: '', priority: 'medium' })
}

function toggle(id: number) {
  const task = tasks.value.find((t) => t.id === id)
  if (task) toggleTask(task)
}

const isOnline = useOnline()
</script>

<template>
  <h1>Task Board</h1>
  <RouterLink :to="{ name: 'task-new' }">+ New task (full form)</RouterLink>
  <p v-if="!isOnline" role="status" class="banner">You are offline. Showing cached data.</p>

  <TaskForm @add="addTask" />
  <p v-if="createError" role="alert" class="error" data-test="create-error">
    {{ errorMessage(createError) }}
  </p>

  <!-- The 3 states every async UI needs: loading, error, data -->
  <p v-if="isPending" role="status" data-test="loading">Loading tasks…</p>

  <div v-else-if="isError" role="alert" class="banner" data-test="load-error">
    Could not load tasks: {{ error?.message }}
    <button type="button" @click="refetch()">Retry</button>
  </div>

  <template v-else>
    <div class="toolbar">
      <p data-test="remaining">
        {{ remaining }} remaining
        <!-- isFetching = background refetch while showing cached data (stale-while-revalidate) -->
        <small v-if="isFetching" data-test="refreshing">· syncing…</small>
      </p>
      <TaskFilter v-model="filter" />
      <button
        type="button"
        :disabled="isClearing"
        @click="clearCompleted(tasks.filter((t) => t.done).map((t) => t.id))"
      >
        Clear completed
      </button>
    </div>

    <TaskList :tasks="visibleTasks" @toggle="toggle" @remove="removeTask">
      <template #empty>
        <p>No tasks yet 🎉</p>
      </template>
    </TaskList>
  </template>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.banner {
  padding: 0.5rem;
  background: #fff3cd;
}
.error {
  color: #c0392b;
}
</style>
