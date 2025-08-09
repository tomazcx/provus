<script setup lang="ts">
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { IAplicacao } from "~/types/IAplicacao";

const props = defineProps<{
  aplicacao: IAplicacao;
  timer: string | null;
}>();

const emit = defineEmits<{
  (e: "ajustar-tempo", segundos: number): void;
  (e: "finalizar" | "pausar" | "retomar" | "reiniciar"): void;
}>();

const isPaused = computed(
  () => props.aplicacao.estado === EstadoAplicacaoEnum.PAUSADA
);

const isConcludedOrFinalized = computed(
  () =>
    props.aplicacao.estado === EstadoAplicacaoEnum.FINALIZADA ||
    props.aplicacao.estado === EstadoAplicacaoEnum.CONCLUIDA
);

const isInProgress = computed(
  () => props.aplicacao.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
);

const ajustarTempo = (segundos: number) => emit("ajustar-tempo", segundos);
const handleEndTest = () => emit("finalizar");

const handleTogglePause = () => {
  if (isPaused.value) {
    emit("retomar");
  } else {
    emit("pausar");
  }
};

const handleResetTimer = () => emit("reiniciar");
</script>

<template>
  <div class="mb-8">
    <div
      class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Monitoramento da Avaliação
        </h1>
        <p class="text-gray-600">
          Acompanhamento em tempo real de: {{ aplicacao.titulo }}
        </p>
      </div>

      <div class="flex items-center space-x-4">
        <UCard v-if="!isConcludedOrFinalized">
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <p class="text-xs text-gray-500 mb-1">Tempo Restante</p>
              <div class="text-2xl font-bold text-primary">
                <span v-if="!isInProgress">Pausado</span>
                <span v-else>{{ timer ?? "--:--:--" }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <UTooltip text="Diminuir 1 min">
                <UButton
                  color="primary"
                  variant="subtle"
                  icon="i-lucide-minus"
                  class="rounded-full"
                  @click="ajustarTempo(-60)"
                />
              </UTooltip>
              <UTooltip
                :text="!isInProgress ? 'Continuar Timer' : 'Pausar Timer'"
              >
                <UButton
                  :color="!isInProgress ? 'secondary' : 'warning'"
                  :icon="!isInProgress ? 'i-lucide-play' : 'i-lucide-pause'"
                  class="rounded-full w-10 h-10 justify-center"
                  @click="handleTogglePause"
                />
              </UTooltip>
              <UTooltip text="Aumentar 1 min">
                <UButton
                  color="primary"
                  variant="subtle"
                  icon="i-lucide-plus"
                  class="rounded-full"
                  @click="ajustarTempo(60)"
                />
              </UTooltip>

              <UTooltip text="Reiniciar Timer">
                <UButton
                  color="primary"
                  variant="soft"
                  icon="i-lucide-rotate-cw"
                  class="rounded-full w-10 h-10 justify-center ml-2"
                  @click="handleResetTimer"
                />
              </UTooltip>
            </div>
          </div>
        </UCard>

        <div class="flex flex-col gap-2">
          <UBadge
            v-if="isInProgress"
            color="secondary"
            size="lg"
            class="justify-center animate-pulse"
          >
            <div class="w-2 h-2 rounded-full bg-white animate-pulse" />
            Live
          </UBadge>
          <UBadge
            v-if="isConcludedOrFinalized"
            color="error"
            variant="subtle"
            size="lg"
            class="justify-center"
          >
            Finalizada
          </UBadge>
          <UButton
            color="primary"
            icon="i-lucide-stop-circle"
            :disabled="isConcludedOrFinalized"
            @click="handleEndTest"
          >
            Finalizar
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
