<script setup lang="ts">
// STEP 1: Reactivity basics
// Next.js/React mapping:
//   ref()      ≈ useState()   (but you mutate .value directly, no setter)
//   computed() ≈ useMemo()    (deps are tracked automatically, no deps array)
//   watch()    ≈ useEffect()  (runs only when the watched source changes)
import { ref, computed, watch } from 'vue'

interface Task {
  id: number
  title: string
  done: boolean
}

const newTitle = ref('')
const tasks = ref<Task[]>([
  { id: 1, title: 'Learn ref & computed', done: true },
  { id: 2, title: 'Learn v-for & v-model', done: false },
])

const remaining = computed(() => tasks.value.filter((t) => !t.done).length)

function addTask() {
  const title = newTitle.value.trim()
  if (!title) return
  tasks.value.push({ id: Date.now(), title, done: false }) // mutate directly, Vue tracks it
  newTitle.value = ''
}

function removeTask(id: number) {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}

watch(remaining, (n) => {
  document.title = n ? `(${n}) Task Board` : 'Task Board'
})
</script>

<template>
  <h1>Task Board</h1>

  <!-- @submit.prevent = onSubmit={e => { e.preventDefault(); ... }} -->
  <form @submit.prevent="addTask">
    <!-- v-model = value + onChange in one -->
    <input v-model="newTitle" placeholder="New task" aria-label="New task" />
    <button type="submit" :disabled="!newTitle.trim()">Add</button>
  </form>

  <p data-test="remaining">{{ remaining }} remaining</p>

  <!-- v-if / v-else = {cond ? a : b} -->
  <ul v-if="tasks.length">
    <!-- v-for + :key = tasks.map(t => <li key={t.id}>) -->
    <li v-for="task in tasks" :key="task.id" :class="{ done: task.done }">
      <label>
        <input v-model="task.done" type="checkbox" />
        {{ task.title }}
      </label>
      <button type="button" @click="removeTask(task.id)">✕</button>
    </li>
  </ul>
  <p v-else>No tasks yet 🎉</p>
</template>

<style scoped>
/* scoped = CSS Modules without the import */
form {
  display: flex;
  gap: 0.5rem;
}
input:not([type='checkbox']) {
  flex: 1;
  padding: 0.4rem;
}
ul {
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}
.done {
  color: #999;
  text-decoration: line-through;
}
</style>
