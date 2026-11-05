<script setup lang="ts">
// STEP 7: the header and the board both call useTasksQuery().
// Same query key → ONE request, one cache entry, both update together (dedupe).
// In step 05 Pinia did this job; for server data the query cache does it now.
import { computed, useTemplateRef } from 'vue'
import { useTasksQuery } from '@/queries/tasks'
// STEP 9: app shell pieces
import ErrorBoundary from '@/components/app/ErrorBoundary.vue'
import ToastHost from '@/components/app/ToastHost.vue'
import ConfirmHost from '@/components/app/ConfirmHost.vue'
import RouteAnnouncer from '@/components/app/RouteAnnouncer.vue'

const { data } = useTasksQuery()
const remaining = computed(() => data.value?.filter((t) => !t.done).length ?? '…')

const main = useTemplateRef('main')
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

  <!-- tabindex=-1: focusable by code (RouteAnnouncer), but not in the Tab order -->
  <main ref="main" tabindex="-1">
    <ErrorBoundary>
      <!-- KeepAlive ≈ keeping a hidden component mounted. The board keeps its typed text,
           filter and scroll when you open a task and come back. Only the board: caching every
           page wastes memory and can show stale forms. -->
      <RouterView v-slot="{ Component }">
        <KeepAlive include="BoardView">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </ErrorBoundary>
  </main>

  <RouteAnnouncer :focus-target="main" />
  <ToastHost />
  <ConfirmHost />
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
main:focus {
  outline: none;
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
