<script setup lang="ts">
// STEP 4: Vue Router
// App.vue is now the root layout ≈ app/layout.tsx in Next.js.
</script>

<template>
  <header>
    <nav aria-label="Main">
      <!-- active-class is added automatically, like usePathname() + className -->
      <RouterLink to="/">Board</RouterLink>
      <RouterLink to="/playground">Playground</RouterLink>
    </nav>
  </header>

  <main>
    <!-- RouterView ≈ {children} in layout.tsx: the matched page renders here -->
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
</style>
