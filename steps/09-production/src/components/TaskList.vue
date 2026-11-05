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
    <!-- v-memo (perf): skip re-rendering a row unless its title or done changed.
         Measure first; only worth it for long lists. React equivalent: React.memo on the row. -->
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      v-memo="[task.title, task.done]"
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
