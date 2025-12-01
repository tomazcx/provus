<script setup lang="ts">
import type { IProgressoAluno } from "~/types/interfaces/IMonitoring";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import { useMonitoringStore } from "~/store/monitoringStore";

defineProps({
  progressoAlunos: {
    type: Array as PropType<IProgressoAluno[]>,
    required: true,
  },
  getTempoRestante: {
    type: Function as PropType<(aluno: IProgressoAluno) => string>,
    required: true,
  },
});

const emit = defineEmits(["view-submission"]);

const monitoringStore = useMonitoringStore();
const toast = useToast();

const codigoAConfirmar = ref<{
  submissaoId: number | null;
  codigo: string;
  isLoading: boolean;
}>({
  submissaoId: null,
  codigo: "",
  isLoading: false,
});

function openPopover(aluno: IProgressoAluno) {
  codigoAConfirmar.value.submissaoId = aluno.submissaoId;
  codigoAConfirmar.value.codigo = "";
  codigoAConfirmar.value.isLoading = false;
}

async function handleConfirmarCodigo(aluno: IProgressoAluno) {
  if (
    !codigoAConfirmar.value.codigo ||
    codigoAConfirmar.value.codigo.length !== 6
  ) {
    toast.add({
      title: "Código inválido",
      description: "O código deve ter 6 dígitos.",
      color: "error",
    });
    return;
  }
  codigoAConfirmar.value.isLoading = true;
  const success = await monitoringStore.confirmarCodigo(
    aluno.submissaoId,
    parseInt(codigoAConfirmar.value.codigo, 10)
  );
  codigoAConfirmar.value.isLoading = false;

  if (success) {
    const popoverButton = document.getElementById(
      `monitor-popover-btn-${aluno.submissaoId}`
    );
    popoverButton?.click();
  }
}

type UBadgeColor =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "gray"
  | "primary"
  | "white"
  | "black"
  | "secondary"
  | "primary-light"
  | "primary-dark"
  | "secondary-light"
  | "secondary-dark"
  | "neutral"
  | undefined;

function getStatusVisuals(estado: EstadoSubmissaoEnum): {
  text: string;
  color: UBadgeColor;
} {
  const map: Record<string, { text: string; color: UBadgeColor }> = {
    [EstadoSubmissaoEnum.INICIADA]: { text: "Ativo", color: "success" },
    [EstadoSubmissaoEnum.PAUSADA]: { text: "Pausado", color: "warning" },
    [EstadoSubmissaoEnum.AVALIADA]: { text: "Finalizado", color: "info" },
    [EstadoSubmissaoEnum.ENVIADA]: { text: "Finalizado", color: "info" },
    [EstadoSubmissaoEnum.ABANDONADA]: { text: "Abandonou", color: "error" },
    [EstadoSubmissaoEnum.ENCERRADA]: { text: "Encerrado", color: "gray" },
    [EstadoSubmissaoEnum.CANCELADA]: { text: "Cancelado", color: "error" },
    [EstadoSubmissaoEnum.REABERTA]: { text: "Reaberto", color: "warning" },
    [EstadoSubmissaoEnum.CODIGO_CONFIRMADO]: {
      text: "Código Confirmado",
      color: "secondary",
    },
  };
  return map[estado] || { text: estado || "Desconhecido", color: "gray" };
}

function handleCardClick(aluno: IProgressoAluno) {
  emit("view-submission", aluno);
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">Progresso dos Alunos</h2>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="aluno in progressoAlunos"
        :key="aluno.submissaoId"
        class="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group relative"
        @click="handleCardClick(aluno)"
      >
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <UIcon name="i-lucide-external-link" class="text-gray-400 w-4 h-4" />
        </div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <UAvatar :alt="aluno.aluno.nome" size="sm" />
            <span
              class="font-medium text-gray-900 text-sm truncate max-w-[150px]"
              >{{ aluno.aluno.nome }}</span
            >
          </div>
          <UBadge
            :color="getStatusVisuals(aluno.estado).color"
            variant="subtle"
            >{{ getStatusVisuals(aluno.estado).text }}</UBadge
          >
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso</span>
            <span
              >{{ aluno.questoesRespondidas }}/{{ aluno.totalQuestoes }}</span
            >
          </div>
          <UProgress
            v-model="aluno.progresso"
            :color="aluno.alertas > 0 ? 'error' : 'secondary'"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span
            >Iniciou:
            {{ new Date(aluno.horaInicio).toLocaleTimeString("pt-BR") }}</span
          >
          <span class="font-mono font-medium">{{
            getTempoRestante(aluno)
          }}</span>
        </div>

        <div
          class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="flex items-center space-x-2">
            <Icon
              name="i-lucide-shield-alert"
              class="h-4 w-4"
              :class="aluno.alertas > 0 ? 'text-error-500' : 'text-gray-400'"
            />
            <span
              class="text-sm font-medium"
              :class="aluno.alertas > 0 ? 'text-error-600' : 'text-gray-500'"
            >
              {{ aluno.alertas }} Alerta(s)
            </span>
          </div>

          <div v-next-click-outside-stop @click.stop>
            <UPopover
              v-if="
                aluno.estado === EstadoSubmissaoEnum.AVALIADA ||
                aluno.estado === EstadoSubmissaoEnum.ENVIADA
              "
              mode="click"
            >
              <UButton
                :id="`monitor-popover-btn-${aluno.submissaoId}`"
                label="Confirmar"
                size="xs"
                color="warning"
                variant="outline"
                @click.stop="openPopover(aluno)"
              />
              <template #content>
                <div class="p-4 w-64 space-y-3" @click.stop>
                  <p class="text-sm font-medium">
                    Confirmar: {{ aluno.aluno.nome }}
                  </p>
                  <UInput
                    v-model="codigoAConfirmar.codigo"
                    placeholder="Código de 6 dígitos"
                    maxlength="6"
                    :disabled="codigoAConfirmar.isLoading"
                  />
                  <UButton
                    label="OK"
                    size="sm"
                    block
                    :loading="
                      codigoAConfirmar.isLoading &&
                      codigoAConfirmar.submissaoId === aluno.submissaoId
                    "
                    @click.stop="handleConfirmarCodigo(aluno)"
                  />
                </div>
              </template>
            </UPopover>
            <UBadge
              v-else-if="aluno.estado === EstadoSubmissaoEnum.CODIGO_CONFIRMADO"
              color="secondary"
              variant="solid"
              size="xs"
            >
              <Icon name="i-lucide-check" class="h-3 w-3 mr-1" />
              Confirmado
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
