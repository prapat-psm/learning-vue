<script setup lang="ts">
import { playgroundSteps } from './steps'
</script>

<template>
  <!-- Layout for every /playground/* route ≈ app/playground/layout.tsx -->
  <section class="playground">
    <nav aria-label="Steps">
      <RouterLink :to="{ name: 'playground' }" exact-active-class="current">Overview</RouterLink>
      <RouterLink
        v-for="step in playgroundSteps"
        :key="step.id"
        :to="{ name: `playground-${step.id}` }"
        exact-active-class="current"
      >
        {{ step.id }} · {{ step.title }}
      </RouterLink>
    </nav>

    <div class="stage">
      <!-- Nested RouterView: the child route renders here.
           Suspense-like fallback is not needed: the router waits for the lazy chunk before switching. -->
      <RouterView />
    </div>
  </section>
</template>

<style scoped>
nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}
.current {
  font-weight: bold;
}
.stage {
  padding-top: 1rem;
}
</style>
