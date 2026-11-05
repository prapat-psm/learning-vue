<script setup lang="ts">
import { onErrorCaptured, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { logger } from '@/lib/logger'

/**
 * ≈ React Error Boundary (class component with componentDidCatch), but a normal component.
 * onErrorCaptured catches errors from ANY descendant: render, setup, lifecycle, watchers, handlers.
 * Return false → the error stops here (does not reach app.config.errorHandler).
 */
const error = shallowRef<Error>()

onErrorCaptured((err, _instance, info) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  logger.reportError(err, { source: 'error-boundary', info })
  return false
})

// A new page = a fresh start (otherwise one broken page would break navigation forever)
const route = useRoute()
watch(
  () => route.fullPath,
  () => (error.value = undefined),
)
</script>

<template>
  <div v-if="error" role="alert" class="crash" data-test="error-boundary">
    <h1>Something went wrong</h1>
    <p>This page crashed. The error was reported.</p>
    <details>
      <summary>Details</summary>
      <code>{{ error.message }}</code>
    </details>
    <button type="button" @click="error = undefined">Try again</button>
    <RouterLink to="/">Back to the board</RouterLink>
  </div>
  <slot v-else />
</template>

<style scoped>
.crash {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
}
</style>
