<script setup lang="ts">
// STEP 5: Pinia
// The header and the board are different components, but read the SAME store.
// In step 04 this counter would need props drilling or would go out of sync.
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'

const store = useTasksStore()
// storeToRefs keeps reactivity when destructuring state/getters (≈ toRefs for stores)
const { remaining } = storeToRefs(store)
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
