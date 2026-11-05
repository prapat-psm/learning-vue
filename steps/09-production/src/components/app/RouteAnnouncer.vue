<script setup lang="ts">
import { nextTick, onUnmounted, ref } from 'vue'
import { START_LOCATION, useRouter } from 'vue-router'

/**
 * a11y for SPAs: a real page load makes screen readers read the new title and resets focus.
 * Client-side navigation does neither, so we do it ourselves (Next.js App Router has a built-in
 * route announcer that does the same).
 */
const props = defineProps<{ focusTarget?: HTMLElement | null }>()
const message = ref('')
const router = useRouter()

const stop = router.afterEach(async (to, from, failure) => {
  if (failure) return
  if (from === START_LOCATION) return // initial page load: the browser already handled it
  if (to.path === from.path) return // only query/hash changed
  await nextTick()
  message.value = document.title
  props.focusTarget?.focus({ preventScroll: true })
})
onUnmounted(stop)
</script>

<template>
  <p class="sr-only" aria-live="assertive" aria-atomic="true" data-test="route-announcer">
    {{ message }}
  </p>
</template>

<style scoped>
/* Visually hidden but readable by screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
