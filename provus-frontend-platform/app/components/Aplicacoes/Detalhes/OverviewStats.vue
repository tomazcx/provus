<script setup lang="ts">
import type { AplicacaoStatsEntity } from "~/types/entities/Aplicacao.entity";
defineProps<{
  stats: AplicacaoStatsEntity;
}>();
</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Total de Participantes</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ stats.totalSubmissoes }}
          </p>
        </div>
        <Icon name="i-lucide-users" class="text-xl text-gray-400" />
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Média Geral (%)</p>
          <p class="text-3xl font-bold text-secondary">
            {{ stats.mediaGeralPercentual?.toFixed(1) ?? "--" }}%
          </p>
        </div>
        <Icon name="i-lucide-trending-up" class="text-xl text-gray-400" />
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Taxa de Conclusão</p>
          <p class="text-3xl font-bold">
            {{ stats.taxaDeConclusaoPercentual?.toFixed(1) ?? "--" }}%
          </p>
        </div>
        <Icon name="i-lucide-pie-chart" class="text-xl text-gray-400" />
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Tempo Médio Conclusão</p>
          <p class="text-3xl font-bold">
            {{
              stats.tempoMedioMinutos !== null
                ? `${stats.tempoMedioMinutos} min`
                : "--"
            }}
          </p>
        </div>
        <Icon name="i-lucide-timer" class="text-xl text-gray-400" />
      </div>
    </UCard>
  </div>
</template>
