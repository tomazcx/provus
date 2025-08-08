<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";

const props = defineProps<{
  aplicacao: IAplicacao | null;
  level: "details" | "results";
}>();

const breadcrumbItems = computed(() => {
  if (!props.aplicacao) return [];

  const crumbs = [{ label: "Aplicações", to: "/aplicacoes" }];
  crumbs.push({
    label: props.aplicacao.titulo,
    to: `/aplicacoes/aplicacao/${props.aplicacao.id}`,
  });

  if (props.level === "results") {
    crumbs.push({
      label: "Resultados",
      to: `/aplicacoes/aplicacao/${props.aplicacao.id}/resultados`,
    });
  }

  return crumbs;
});
</script>

<template>
  <div class="mb-6">
    <UBreadcrumb :items="breadcrumbItems" />
  </div>
</template>
