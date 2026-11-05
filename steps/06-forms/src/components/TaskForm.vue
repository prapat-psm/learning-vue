<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseInput from './BaseInput.vue'
import { titleSchema } from '@/schemas/task'

// STEP 06 part 1: validation WITHOUT a library.
// Good enough for one field. For real forms see TaskEditor.vue (VeeValidate).
const emit = defineEmits<{ add: [title: string] }>()

const title = ref('')
const submitted = ref(false) // only show errors after the first submit attempt

// Reuse the SAME rule as the big form (titleSchema), so the two can't disagree
const error = computed(() => {
  if (!submitted.value) return ''
  const result = titleSchema.safeParse(title.value)
  return result.success ? '' : result.error.issues[0]!.message
})

function submit() {
  submitted.value = true
  const result = titleSchema.safeParse(title.value)
  if (!result.success) return
  emit('add', result.data) // already trimmed by the schema
  title.value = ''
  submitted.value = false
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <div class="row">
      <BaseInput
        v-model="title"
        label="New task"
        placeholder="New task"
        :aria-invalid="!!error"
        aria-describedby="quick-add-error"
      />
      <button type="submit" :disabled="!title.trim()">Add</button>
    </div>
    <!-- role="alert": screen readers announce the error when it appears -->
    <p v-if="error" id="quick-add-error" role="alert" class="error">{{ error }}</p>
  </form>
</template>

<style scoped>
.row {
  display: flex;
  gap: 0.5rem;
}
.error {
  margin: 0.25rem 0 0;
  color: #c0392b;
  font-size: 0.9em;
}
</style>
