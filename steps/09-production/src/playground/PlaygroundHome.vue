<script setup lang="ts">
import { playgroundSteps } from './steps'
</script>

<template>
  <h1>Playground</h1>
  <p>Every earlier step runs here, unchanged, as a lazy nested route.</p>
  <ul>
    <li v-for="step in playgroundSteps" :key="step.id">
      <RouterLink :to="`/playground/${step.id}`">Step {{ step.id }}: {{ step.title }}</RouterLink>
    </li>
  </ul>
</template>
