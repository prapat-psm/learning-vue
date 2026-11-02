<script setup lang="ts">
import type { Task } from '@/types'

// Props are READ-ONLY (same as React). Never do props.task.done = true here.
// Instead tell the parent via an event ("props down, events up").
const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()
</script>

<template>
  <li :class="{ done: props.task.done }">
    <label>
      <input type="checkbox" :checked="task.done" @change="emit('toggle', task.id)" />
      {{ task.title }}
    </label>
    <button type="button" :aria-label="`Remove ${task.title}`" @click="emit('remove', task.id)">
      ✕
    </button>
  </li>
</template>

<style scoped>
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
