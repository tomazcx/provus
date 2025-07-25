<script setup lang="ts">
import type EstadoAvaliacaoEnum from "~/enums/EstadoAvaliacaoEnum";

const props = defineProps<{
  icone?: string;
  iconeBg?: string;
  titulo?: string;
  descricao?: string;
  estado?: EstadoAvaliacaoEnum;
  estadoBg?: string;
  atualizadoEm?: string;
}>();
</script>

<template>
  <UCard
    class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-start justify-between mb-4">
      <div
        :class="`${props.iconeBg} w-12 h-12 rounded-lg flex items-center justify-center`"
      >
        <Icon :name="props.icone as string" class="text-xl" />
      </div>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{ props.titulo }}
    </h3>
    <p class="text-sm text-gray-600 mb-4">{{ props.descricao }}</p>
    <div class="flex items-center justify-between mb-3">
      <UBadge :class="`${props.estadoBg}`">{{ props.estado }}</UBadge>
      <span class="text-xs text-gray-500">{{
        props.estado === "Em andamento"
          ? "Agora"
          : formatTimeDistance(atualizadoEm as string)
      }}</span>
    </div>
  </UCard>
</template>
