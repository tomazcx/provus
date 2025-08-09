<script setup lang="ts">
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { IAplicacao } from "~/types/IAplicacao";

const props = defineProps<{
  item: IAplicacao;
}>();

const emit = defineEmits([
  "view-config",
  "apply-now",
  "cancel-schedule",
  "reopen",
]);

const isEmAndamento = computed(
  () => props.item.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
);

const isAgendada = computed(
  () => props.item.estado === EstadoAplicacaoEnum.AGENDADA
);

const isConcluida = computed(
  () => props.item.estado === EstadoAplicacaoEnum.CONCLUIDA
);

const isPausada = computed(
  () => props.item.estado === EstadoAplicacaoEnum.PAUSADA
);

const isFinishedOrCancelled = computed(() =>
  [
    EstadoAplicacaoEnum.CONCLUIDA,
    EstadoAplicacaoEnum.FINALIZADA,
    EstadoAplicacaoEnum.CANCELADA,
  ].includes(props.item.estado)
);

const statusVisuals = computed(() => {
  switch (props.item.estado) {
    case EstadoAplicacaoEnum.PAUSADA:
      return {
        icon: "i-lucide-pause-circle",
        iconBgColor: "bg-yellow-100",
        iconTextColor: "text-yellow-600",
        statusBgColor: "bg-yellow-100",
        statusTextColor: "text-yellow-800",
      };
    case EstadoAplicacaoEnum.EM_ANDAMENTO:
      return {
        icon: "i-lucide-hourglass",
        iconBgColor: "bg-yellow-100",
        iconTextColor: "text-yellow-600",
        statusBgColor: "bg-yellow-100",
        statusTextColor: "text-yellow-800",
      };
    case EstadoAplicacaoEnum.AGENDADA:
      return {
        icon: "i-lucide-calendar-clock",
        iconBgColor: "bg-blue-200",
        iconTextColor: "text-blue-600",
        statusBgColor: "bg-blue-200",
        statusTextColor: "text-blue-800",
      };
    case EstadoAplicacaoEnum.CONCLUIDA:
    case EstadoAplicacaoEnum.CANCELADA:
      return {
        icon: "i-lucide-x-circle",
        iconBgColor: "bg-red-100",
        iconTextColor: "text-red-600",
        statusBgColor: "bg-red-100",
        statusTextColor: "text-red-800",
      };
    default:
      return {
        icon: "i-lucide-check-circle-2",
        iconBgColor: "bg-green-100",
        iconTextColor: "text-green-600",
        statusBgColor: "bg-green-100",
        statusTextColor: "text-green-800",
      };
  }
});

const formattedDate = computed(() => {
  return new Date(props.item.dataAplicacao).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            :class="statusVisuals.iconBgColor"
            class="w-12 h-12 rounded-lg flex items-center justify-center"
          >
            <Icon
              :name="statusVisuals.icon"
              :class="statusVisuals.iconTextColor"
              class="text-xl"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ props.item.titulo }}</h3>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-3 mb-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Aplicado em:</span>
        <span class="font-medium text-gray-900">{{ formattedDate }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Alunos:</span>
        <span class="font-medium text-gray-900"
          >{{ props.item.participantes }} participantes</span
        >
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Média:</span>
        <span class="font-medium text-secondary"
          >{{ props.item.mediaGeral }}%</span
        >
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Status:</span>
        <UBadge
          :class="[statusVisuals.statusBgColor, statusVisuals.statusTextColor]"
          variant="subtle"
        >
          {{ props.item.estado }}
        </UBadge>
      </div>
    </div>

    <template v-if="isEmAndamento || isPausada">
      <UButton
        block
        color="primary"
        variant="solid"
        icon="i-lucide-activity"
        :to="`/aplicacoes/aplicacao/${item.id}/monitoramento`"
      >
        Monitorar
      </UButton>

      <UButton
        block
        color="primary"
        variant="outline"
        icon="i-lucide-settings-2"
        class="mt-2"
        @click="emit('view-config', item)"
      >
        Ver Configuração Completa
      </UButton>
    </template>

    <template v-else-if="isFinishedOrCancelled">
      <div class="flex items-center space-x-2">
        <UButton block :to="`/aplicacoes/aplicacao/${item.id}`">
          Ver Detalhes
        </UButton>
        <UButton
          block
          color="secondary"
          variant="solid"
          :to="`/aplicacoes/aplicacao/${item.id}/resultados`"
        >
          Resultados
        </UButton>
      </div>
      <UButton
        v-if="item.estado !== 'Cancelada'"
        block
        color="primary"
        variant="soft"
        icon="i-lucide-refresh-cw"
        class="mt-2"
        @click="emit('reopen', item)"
      >
        Reabrir Aplicação
      </UButton>

      <UButton
        block
        color="primary"
        variant="outline"
        icon="i-lucide-settings-2"
        class="mt-2"
        @click="emit('view-config', item)"
      >
        Ver Configuração Completa
      </UButton>
    </template>

    <template v-else-if="isAgendada">
      <div class="flex items-center space-x-2 mb-2">
        <UButton
          block
          color="secondary"
          icon="i-lucide-play-circle"
          @click="emit('apply-now', item)"
        >
          Aplicar Agora
        </UButton>
        <UButton
          block
          variant="outline"
          icon="i-lucide-pencil"
          :to="`/avaliacao/editor/${item.avaliacaoModeloId}`"
        >
          Editar
        </UButton>
      </div>
      <UButton
        block
        color="error"
        variant="subtle"
        icon="i-lucide-calendar-x-2"
        @click="emit('cancel-schedule', item)"
      >
        Cancelar Agendamento
      </UButton>

      <UButton
        block
        color="primary"
        variant="outline"
        icon="i-lucide-settings-2"
        class="mt-2"
        @click="emit('view-config', item)"
      >
        Ver Configuração Completa
      </UButton>
    </template>

    <template v-else-if="isConcluida">
      <div class="flex items-center space-x-2">
        <UButton block :to="`/aplicacoes/aplicacao/${item.id}`">
          Ver Detalhes
        </UButton>

        <UButton
          block
          color="secondary"
          variant="solid"
          :to="`/aplicacoes/aplicacao/${item.id}/resultados`"
        >
          Resultados
        </UButton>
      </div>

      <UButton
        block
        color="primary"
        variant="outline"
        icon="i-lucide-settings-2"
        class="mt-2"
        @click="emit('view-config', item)"
      >
        Ver Configuração Completa
      </UButton>
    </template>
  </UCard>
</template>
