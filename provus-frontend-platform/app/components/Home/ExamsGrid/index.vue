<script setup lang="ts">
import EstadoAvaliacaoEnum from "~/enums/EstadoAvaliacaoEnum";
import ExamCard from "../ExamCard/index.vue";
import { mockDashboardResponse } from "~/mock/mockDashboardResponse";

const style = {
  Finalizado: {
    icone: "i-lucide-check-circle",
    iconeBg: "bg-green-100 text-green-800",
  },
  "Em andamento": {
    icone: "i-lucide-clock",
    iconeBg: "bg-yellow-100 text-yellow-800",
  },
  Agendado: {
    icone: "i-lucide-calendar",
    iconeBg: "bg-purple-100 text-purple-800",
  },
};

const cardsResponse = mockDashboardResponse.ultimosEventos || [];

const cards = cardsResponse.map((card) => {
  if (card.estado === EstadoAvaliacaoEnum.FINALIZADA) {
    return {
      ...card,
      icone: style.Finalizado.icone,
      iconeBg: style.Finalizado.iconeBg,
      estadoBg: "bg-green-100 text-green-800",
    };
  } else if (card.estado === EstadoAvaliacaoEnum.EM_ANDAMENTO) {
    return {
      ...card,
      icone: style["Em andamento"].icone,
      iconeBg: style["Em andamento"].iconeBg,
      estadoBg: "bg-yellow-100 text-yellow-800",
    };
  } else if (card.estado === EstadoAvaliacaoEnum.AGENDADA) {
    return {
      ...card,
      icone: style.Agendado.icone,
      iconeBg: style.Agendado.iconeBg,
      estadoBg: "bg-purple-100 text-purple-800",
    };
  }
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ExamCard v-for="c in cards" :key="c?.id" v-bind="c" />
  </div>
</template>
