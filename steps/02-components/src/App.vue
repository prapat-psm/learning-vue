<script setup lang="ts">
// STEP 2: Components
// App owns the state. Children get data via props and report changes via emits.
import { ref, computed } from 'vue'
import type { Task } from './types'
import TaskForm from './components/TaskForm.vue'
import TaskList from './components/TaskList.vue'

const tasks = ref<Task[]>([
  { id: 1, title: 'Learn ref & computed', done: true },
  { id: 2, title: 'Learn props & emits', done: false },
])

const remaining = computed(() => tasks.value.filter((t) => !t.done).length)

function addTask(title: string) {
  tasks.value.push({ id: Date.now(), title, done: false })
}

function toggleTask(id: number) {
  const task = tasks.value.find((t) => t.id === id)
  if (task) task.done = !task.done
}

function removeTask(id: number) {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}
</script>

<template>
  <h1>Task Board</h1>
  <TaskForm @add="addTask" />
  <p data-test="remaining">{{ remaining }} remaining</p>
  <TaskList :tasks="tasks" @toggle="toggleTask" @remove="removeTask">
    <!-- Fill the named slot. React: <TaskList empty={<p>...</p>} /> -->
    <template #empty>
      <p>No tasks yet 🎉</p>
    </template>
  </TaskList>
</template>
