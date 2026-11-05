<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useOnline } from '@/composables/useOnline'
import TaskForm from '@/components/TaskForm.vue'
import TaskList from '@/components/TaskList.vue'
import TaskFilter from '@/components/TaskFilter.vue'

const store = useTasksStore()

// ✅ state + getters → storeToRefs (stay reactive)
const { filter, remaining, visibleTasks } = storeToRefs(store)
// ✅ actions → destructure directly (they are plain functions)
const { addTask, toggleTask, removeTask, clearCompleted } = store
// ❌ const { remaining } = store   → a plain number, never updates

const isOnline = useOnline()
</script>

<template>
  <h1>Task Board</h1>
  <RouterLink :to="{ name: 'task-new' }">+ New task (full form)</RouterLink>
  <p v-if="!isOnline" role="status" class="offline">You are offline. Changes are saved locally.</p>

  <TaskForm @add="addTask" />

  <div class="toolbar">
    <p data-test="remaining">{{ remaining }} remaining</p>
    <TaskFilter v-model="filter" />
    <button type="button" @click="clearCompleted">Clear completed</button>
  </div>

  <TaskList :tasks="visibleTasks" @toggle="toggleTask" @remove="removeTask">
    <template #empty>
      <p>No tasks yet 🎉</p>
    </template>
  </TaskList>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.offline {
  padding: 0.5rem;
  background: #fff3cd;
}
</style>
