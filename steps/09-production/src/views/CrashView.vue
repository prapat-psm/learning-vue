<script setup lang="ts">
// Debug page: throws while rendering, to see <ErrorBoundary> work. Open /debug/error.
// (A real app would keep pages like this out of production builds.)
function explode(): string {
  throw new Error('Boom: this page throws on purpose')
}
</script>

<template>
  <p>{{ explode() }}</p>
</template>
