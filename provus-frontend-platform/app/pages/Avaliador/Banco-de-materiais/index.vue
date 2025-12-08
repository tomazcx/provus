<script setup lang="ts">
import MaterialsBankContent from "@/components/BancoDeMateriais/MaterialsBankContent/index.vue";
import { useMaterialsBankStore } from "~/store/materialsBankStore";

const pageTitle = "Banco de Materiais";

const materialsBankStore = useMaterialsBankStore();

onUnmounted(() => {
  materialsBankStore.resetNavigation();
});
</script>

<template>
  <div>
    <div>
      <h1 class="text-3xl font-bold text-primary">{{ pageTitle }}</h1>
      <p v-if="pageTitle === 'Banco de Materiais'" class="text-gray-600 mt-1">
        Organize e gerencie seu banco de materiais
      </p>
    </div>

    <MaterialsBankContent />
  </div>
</template>
