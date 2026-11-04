<script setup lang="ts">
// defineModel() = two-way binding for a custom component.
// Parent writes <BaseInput v-model="title" />
// React equivalent: <BaseInput value={title} onChange={setTitle} />
// Under the hood it is prop `modelValue` + emit `update:modelValue`.
const model = defineModel<string>({ required: true })

// Plain props still work next to defineModel
defineProps<{ label: string; placeholder?: string }>()
</script>

<template>
  <input v-model="model" :aria-label="label" :placeholder="placeholder" class="base-input" />
</template>

<style scoped>
.base-input {
  flex: 1;
  padding: 0.4rem;
}
</style>
