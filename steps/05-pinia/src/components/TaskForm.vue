<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

// defineEmits = typed callback props. React: props.onAdd?.(title)
const emit = defineEmits<{ add: [title: string] }>()

// Local state: the form owns its draft, the parent owns the list
const title = ref('')

function submit() {
  const value = title.value.trim()
  if (!value) return
  emit('add', value)
  title.value = ''
}
</script>

<template>
  <form @submit.prevent="submit">
    <BaseInput v-model="title" label="New task" placeholder="New task" />
    <button type="submit" :disabled="!title.trim()">Add</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5rem;
}
</style>
