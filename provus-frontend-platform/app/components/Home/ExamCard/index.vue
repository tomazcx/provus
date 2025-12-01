<script setup lang="ts">
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const props = defineProps<{
  item: AplicacaoEntity;
}>();

type StateVisual = {
  status: string;
  icon: string;
  color: string;
};

const stateMap: Partial<Record<EstadoAplicacaoEnum, StateVisual>> = {
  [EstadoAplicacaoEnum.CONCLUIDA]: {
    status: "Concluída",
    icon: "i-lucide-check-circle",
    color: "green",
  },
  [EstadoAplicacaoEnum.FINALIZADA]: {
    status: "Finalizada",
    icon: "i-lucide-check-circle",
    color: "green",
  },
  [EstadoAplicacaoEnum.EM_ANDAMENTO]: {
    status: "Em Andamento",
    icon: "i-lucide-clock",
    color: "yellow",
  },
  [EstadoAplicacaoEnum.AGENDADA]: {
    status: "Agendada",
    icon: "i-lucide-calendar",
    color: "purple",
  },
  [EstadoAplicacaoEnum.CANCELADA]: {
    status: "Cancelada",
    icon: "i-lucide-x-circle",
    color: "red",
  },
  [EstadoAplicacaoEnum.PAUSADA]: {
    status: "Pausada",
    icon: "i-lucide-pause-circle",
    color: "yellow",
  },
  [EstadoAplicacaoEnum.CRIADA]: {
    status: "Criada",
    icon: "i-lucide-plus-circle",
    color: "blue",
  },
};

const visual = computed(
  () =>
    stateMap[props.item.estado] || {
      status: props.item.estado,
      icon: "i-lucide-help-circle",
      color: "gray",
    }
);

const formattedDate = computed(() => {
  return props.item.dataInicio.toLocaleDateString("pt-BR");
});

const participantsLabel = computed(() => {
  return props.item.totalSubmissoes === 1
    ? "1 participante"
    : `${props.item.totalSubmissoes} participantes`;
});

const mediaLabel = computed(() => {
  const media = props.item.mediaGeralPercentual;
  if (media !== null && media !== undefined && typeof media === "number") {
    return `Média ${media.toFixed(0)}%`;
  }
  return "Sem média";
});
</script>

<template>
  <NuxtLink :to="`/aplicacoes/aplicacao/${item.id}`">
    <div
      class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer h-full"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4 w-full">
          <div
            :class="`bg-${visual.color}-100`"
            class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          >
            <Icon
              :name="visual.icon"
              :class="`text-${visual.color}-600`"
              class="text-xl"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="font-semibold text-gray-900 max-h-[3rem] overflow-hidden relative"
            >
              <RichTextEditor
                :model-value="item.avaliacao.titulo"
                disabled
                min-height=""
                class="!p-0 !bg-transparent !border-none pointer-events-none"
              />
            </div>
            <div
              class="text-sm text-gray-600 mt-1 max-h-[3rem] overflow-hidden opacity-90"
            >
              <RichTextEditor
                v-if="item.avaliacao.descricao"
                :model-value="item.avaliacao.descricao"
                disabled
                min-height=""
                class="!p-0 !bg-transparent !border-none pointer-events-none text-sm"
              />
              <span v-else>Sem descrição</span>
            </div>
            <div class="flex items-center space-x-4 mt-2 flex-wrap gap-y-1">
              <UBadge :color="visual.color as any" variant="soft">{{
                visual.status
              }}</UBadge>
              <span class="text-xs text-gray-500">{{ participantsLabel }}</span>
              <span class="text-xs text-gray-500">{{ formattedDate }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end justify-between h-full ml-2">
          <span
            v-if="item.mediaGeralPercentual !== null"
            class="text-xs font-bold text-gray-400 whitespace-nowrap"
          >
            {{ mediaLabel }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
/* Remove margens padrão do editor para alinhar corretamente no card */
:deep(.prose p) {
  margin: 0;
}
</style>
