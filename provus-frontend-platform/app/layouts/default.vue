<script setup lang="ts">
import AppHeader from "@/components/layouts/AppHeader/index.vue";
</script>
<template>
  <div class="font-sans bg-gray-50 min-h-screen">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <slot />
    </main>
  </div>
</template>
