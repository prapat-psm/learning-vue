<script setup lang="ts">
import type { Task } from '@/types'
import TaskItem from './TaskItem.vue'

defineProps<{ tasks: Task[] }>()

// Re-emit child events upward. Same signature as TaskItem.
const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()
</script>

<template>
  <ul v-if="tasks.length">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', $event)"
      @remove="emit('remove', $event)"
    />
  </ul>
  <!-- Named slot with fallback. React: props.empty ?? <p>No tasks</p> -->
  <slot v-else name="empty">
    <p>No tasks</p>
  </slot>
</template>

<style scoped>
ul {
  padding: 0;
  list-style: none;
}
</style>
