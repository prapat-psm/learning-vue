<script setup lang="ts">
// STEP 7: the header and the board both call useTasksQuery().
// Same query key → ONE request, one cache entry, both update together (dedupe).
// In step 05 Pinia did this job; for server data the query cache does it now.
import { computed } from 'vue'
import { useTasksQuery } from '@/queries/tasks'

const { data } = useTasksQuery()
const remaining = computed(() => data.value?.filter((t) => !t.done).length ?? '…')
</script>

<template>
  <header>
    <nav aria-label="Main">
      <RouterLink to="/">
        Board <span class="badge" data-test="header-remaining">{{ remaining }}</span>
      </RouterLink>
      <RouterLink to="/playground">Playground</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
nav .router-link-active {
  font-weight: bold;
}
.badge {
  display: inline-block;
  min-width: 1.4em;
  padding: 0 0.3em;
  border-radius: 1em;
  background: #42b883;
  color: white;
  font-size: 0.8em;
  text-align: center;
}
</style>
