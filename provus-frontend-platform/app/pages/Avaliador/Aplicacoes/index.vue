<script setup lang="ts">
import ControlsSection from "~/components/Aplicacoes/ControlsSection/index.vue";
import ApplicationsGrid from "~/components/Aplicacoes/ApplicationsGrid/index.vue";
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Aplicações de Avaliações
      </h1>
      <p class="text-gray-600">
        Visualize e gerencie as avaliações aplicadas e seus resultados.
      </p>
    </div>

    <ControlsSection />

    <ApplicationsGrid />
  </div>
</template>
