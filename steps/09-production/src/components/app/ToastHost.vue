<script setup lang="ts">
import { useToast } from '@/plugins/toast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <!-- Teleport ≈ React createPortal: rendered at the end of <body>, outside any overflow/z-index trap.
       The live region is ALWAYS in the DOM; screen readers announce what is added to it. -->
  <Teleport to="body">
    <div class="toasts" aria-live="polite" data-test="toasts">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.kind">
        <span>{{ toast.message }}</span>
        <button type="button" aria-label="Dismiss notification" @click="dismiss(toast.id)">
          ✕
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  display: grid;
  gap: 0.5rem;
  z-index: 10;
}
.toast {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: #2c3e50;
  color: white;
}
.toast.error {
  background: #c0392b;
}
.toast button {
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}
</style>
