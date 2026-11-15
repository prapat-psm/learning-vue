<script setup lang="ts">
import type { TaskFilter } from '@/types'

const model = defineModel<TaskFilter>({ required: true })
const options: TaskFilter[] = ['all', 'active', 'done']
</script>

<template>
  <div class="filter" role="group" aria-label="Filter tasks">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      :aria-pressed="model === option"
      @click="model = option"
    >
      {{ option }}
    </button>
  </div>
</template>

<style scoped>
.filter {
  display: flex;
  gap: 0.25rem;
}
[aria-pressed='true'] {
  font-weight: bold;
}
</style>
