<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute() // ≈ usePathname()
</script>

<template>
  <h1>404</h1>
  <p>
    Nothing at <code>{{ route.path }}</code
    >.
  </p>
  <RouterLink to="/">Go to the board</RouterLink>
</template>
