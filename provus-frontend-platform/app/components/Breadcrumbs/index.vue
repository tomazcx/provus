<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";
import type { ISubmissao } from "~/types/ISubmissao";

const props = defineProps<{
  aplicacao: IAplicacao | null;
  submission?: ISubmissao | null;
  level: "details" | "results" | "submission";
}>();

const breadcrumbItems = computed(() => {
  if (!props.aplicacao) return [];

  const crumbs = [
    { label: "Aplicações", to: "/aplicacoes" },
    {
      label: props.aplicacao.titulo,
      to: `/aplicacoes/aplicacao/${props.aplicacao.id}`,
    },
  ];

  if (props.level === "results" || props.level === "submission") {
    crumbs.push({
      label: "Resultados",
      to: `/aplicacoes/aplicacao/${props.aplicacao.id}/resultados`,
    });
  }

  if (props.level === "submission" && props.submission) {
    crumbs.push({
      label: `Submissão de ${props.submission.aluno.nome}`,
      to: "",
    });
  }

  return crumbs;
});
</script>

<template>
  <div v-if="breadcrumbItems.length > 0" class="mb-6">
    <UBreadcrumb :items="breadcrumbItems" />
  </div>
</template>
