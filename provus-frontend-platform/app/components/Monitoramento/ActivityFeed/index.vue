<script setup lang="ts">
import type { ILogAtividade } from "~/types/IMonitoring";
import TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";

defineProps<{
  atividades: ILogAtividade[];
}>();

const activityVisualsMap = {
  [TipoAtividadeEnum.ENTROU]: { icon: "i-lucide-log-in", color: "blue" },
  [TipoAtividadeEnum.FINALIZOU]: {
    icon: "i-lucide-check-circle",
    color: "green",
  },
  [TipoAtividadeEnum.PAUSOU]: {
    icon: "i-lucide-pause-circle",
    color: "yellow",
  },
  [TipoAtividadeEnum.RETOMOU]: {
    icon: "i-lucide-play-circle",
    color: "yellow",
  },
  [TipoAtividadeEnum.PENALIDADE]: {
    icon: "i-lucide-shield-alert",
    color: "red",
  },
};

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">
        Atividade em Tempo Real
      </h2>
    </template>
    <div class="space-y-3 max-h-[450px] overflow-y-auto">
      <div
        v-for="activity in atividades"
        :key="activity.id"
        class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div
          :class="`bg-${activityVisualsMap[activity.tipo].color}-100`"
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        >
          <Icon
            :name="activityVisualsMap[activity.tipo].icon"
            :class="`text-${activityVisualsMap[activity.tipo].color}-600`"
            class="text-sm"
          />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            <span class="font-bold">{{ activity.alunoNome }}</span>
            {{ activity.descricao }}
          </p>
          <p class="text-xs text-gray-500">
            {{ formatTimestamp(activity.timestamp) }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
