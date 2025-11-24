<script setup lang="ts">
import MonitoringHeader from "~/components/Monitoramento/MonitoramentoHeader/index.vue";
import MonitoringStats from "~/components/Monitoramento/MonitoramentoStats/index.vue";
import StudentProgressGrid from "~/components/Monitoramento/StudentProgressGrid/index.vue";
import ActivityFeed from "~/components/Monitoramento/ActivityFeed/index.vue";
import { useMonitoringStore } from "~/store/monitoringStore";
import {
  useApplicationsStore,
  mapAplicacaoApiResponseToEntity,
} from "~/store/applicationsStore";
import type { IProgressoAluno } from "~/types/IMonitoring";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoApiResponse } from "~/types/api/response/Aplicacao.response";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import { useTimer } from "~/composables/useTimer";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import ConfirmationDialog from "~/components/ui/ConfirmationDialog/index.vue";

const route = useRoute();
const router = useRouter();
const monitoringStore = useMonitoringStore();
const applicationsStore = useApplicationsStore();
const toast = useToast();
const nuxtApp = useNuxtApp();

const { $api } = nuxtApp;
const $websocket = nuxtApp.$websocket as
  | ReturnType<typeof useWebSocket>
  | undefined;

const isConfirmOpen = ref(false);
const confirmAction = ref<"finalizar" | "reiniciar" | null>(null);
const confirmTitle = ref("");
const confirmDescription = ref("");
const confirmColor = ref<"warning" | "error">("warning");

const applicationId = parseInt(route.params.id as string, 10);
const isLoading = ref(true);
const error = ref<string | null>(null);

const modeloDaAplicacao = computed<AvaliacaoEntity | null>(() => {
  return aplicacao.value?.avaliacao ?? null;
});

const aplicacao = computed(
  () => applicationsStore.getApplicationById(applicationId) ?? null
);

const breadcrumbs = computed(() => [
  { label: "Aplicações", to: "/aplicacoes" },
  {
    label: modeloDaAplicacao.value?.titulo ?? "Detalhes",
    to: `/aplicacoes/aplicacao/${applicationId}`,
  },
  { label: "Monitoramento" },
]);

const dataFimRef = computed(
  () => aplicacao.value?.dataFim.toISOString() ?? null
);
const isApplicationActive = computed(
  () => aplicacao.value?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
);

const studentProgress = computed(() => monitoringStore.studentProgress);
const activityFeed = computed(() => monitoringStore.activityFeed);

const { tempoRestanteFormatado, tempoRestanteEmSegundos } = useTimer({
  dataFimISO: dataFimRef,
  isActive: isApplicationActive,
});

async function fetchApplicationIfNeeded() {
  isLoading.value = true;
  if (!aplicacao.value) {
    console.log(
      `Monitoramento.vue: Aplicação ${applicationId} não encontrada na store, buscando da API...`
    );
    try {
      const response = await $api<AplicacaoApiResponse>(
        `/backoffice/aplicacao/${applicationId}`
      );
      const entity = mapAplicacaoApiResponseToEntity(response);

      applicationsStore.addOrUpdateApplication(entity);

      console.log(
        `Monitoramento.vue: Aplicação ${applicationId} carregada da API e salva na Store.`
      );
      return true;
    } catch (error) {
      console.error("Erro ao buscar detalhes da aplicação no reload:", error);
      const errorMessage = "Não foi possível carregar os dados da aplicação.";
      toast.add({
        title: "Erro ao Carregar",
        description: errorMessage,
        color: "error",
      });
      router.push("/aplicacoes");
      return false; 
    } finally {
      isLoading.value = false;
    }
  }
  return true;
}
async function fetchMonitoringDetails() {
  try {
    await monitoringStore.fetchMonitoringData(applicationId);
    if ($websocket?.isConnected?.value) {
      monitoringStore.initializeWebSocketListeners();
    } else {
      console.log(
        "Monitoramento.vue: fetchMonitoringDetails - WS não conectado ainda, aguardando watch."
      );
    }
  } catch (err) {
    console.error("Erro ao buscar dados de monitoramento:", err);
    error.value = "Não foi possível carregar os dados de monitoramento.";
    toast.add({ title: "Erro", description: error.value, color: "error" });
  }
}

watch(
  () => aplicacao.value?.dataFim,
  (newVal, oldVal) => {
    if (newVal && oldVal && newVal.getTime() !== oldVal.getTime()) {
      toast.add({
        title: "Tempo Atualizado",
        description: "O cronômetro foi sincronizado com o servidor.",
        color: "info",
        icon: "i-lucide-clock",
      });
    }
  }
);

onMounted(async () => {
  console.log("Monitoramento.vue: onMounted - Iniciando.");
  isLoading.value = true;
  error.value = null;
  monitoringStore.clearWebSocketListeners();
  monitoringStore.currentApplicationId = applicationId;

  const appLoadSuccess = await fetchApplicationIfNeeded();
  if (appLoadSuccess) {
    await fetchMonitoringDetails();
  }

  isLoading.value = false;

  if ($websocket) {
    if (!monitoringStore.listenersInitialized) {
      monitoringStore.initializeWebSocketListeners();
    }

    watch(
      $websocket.isConnected,
      (connected) => {
        if (connected && !monitoringStore.listenersInitialized) {
          monitoringStore.initializeWebSocketListeners();
        }
      },
      { immediate: $websocket.isConnected.value }
    );
  }
});

onUnmounted(() => {
  console.log("Monitoramento.vue: onUnmounted.");
  monitoringStore.currentApplicationId = null;

  monitoringStore.clearWebSocketListeners();
});

function handleFinalizar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    toast.add({ title: "Erro de Conexão WS", color: "error" });
    return;
  }
  confirmTitle.value = "Finalizar Aplicação?";
  confirmDescription.value =
    "Tem certeza que deseja finalizar esta aplicação para todos os alunos? Alunos que não enviaram terão suas provas encerradas.";
  confirmAction.value = "finalizar";
  confirmColor.value = "error";
  isConfirmOpen.value = true;
}

function handlePausar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    toast.add({ title: "Erro de Conexão WS", color: "error" });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo pausar-aplicacao:", payload);
  $websocket.emit("pausar-aplicacao", payload);
}

function handleRetomar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    toast.add({ title: "Erro de Conexão WS", color: "error" });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo retomar-aplicacao:", payload);
  $websocket.emit("retomar-aplicacao", payload);
}

function ajustarTempo(segundos: number) {
  if (!$websocket || !$websocket.isConnected.value) {
    toast.add({
      title: "Erro de Conexão",
      description: "Não foi possível ajustar o tempo.",
      color: "error",
      icon: "i-lucide-wifi-off",
    });
    return;
  }
  if (!aplicacao.value) return;
  const payload = { aplicacaoId: aplicacao.value.id, segundos: segundos };
  console.log("Emitindo ajustar-tempo-aplicacao:", payload);
  $websocket.emit("ajustar-tempo-aplicacao", payload);
}

function handleReiniciar() {
  if (!$websocket || !$websocket.isConnected.value) {
    toast.add({
      title: "Erro de Conexão",
      description: "Não foi possível reiniciar o timer.",
      color: "error",
      icon: "i-lucide-wifi-off",
    });
    return;
  }
  if (!aplicacao.value) return;
  confirmTitle.value = "Reiniciar Timer?";
  confirmDescription.value =
    "Tem certeza que deseja reiniciar o timer para TODOS os alunos nesta aplicação? O tempo será recalculado a partir de agora com a duração original.";
  confirmAction.value = "reiniciar";
  confirmColor.value = "warning";
  isConfirmOpen.value = true;
}

const formatarTempo = (totalSegundos: number): string => {
  if (totalSegundos <= 0) return "00:00:00";
  totalSegundos = Math.max(0, totalSegundos);
  const horas = Math.floor(totalSegundos / 3600)
    .toString()
    .padStart(2, "0");
  const minutos = Math.floor((totalSegundos % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const segundos = Math.floor(totalSegundos % 60)
    .toString()
    .padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
};

function getTempoRestanteAlunoFormatado(aluno: IProgressoAluno): string {
  const estadosFinaisOuInativos: EstadoSubmissaoEnum[] = [
    EstadoSubmissaoEnum.ENCERRADA,
    EstadoSubmissaoEnum.CANCELADA,
    EstadoSubmissaoEnum.ENVIADA,
    EstadoSubmissaoEnum.AVALIADA,
    EstadoSubmissaoEnum.ABANDONADA,
    EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
  ];
  if (estadosFinaisOuInativos.includes(aluno.estado)) {
    return "00:00:00";
  }
  const penalidade = aluno.tempoPenalidadeEmSegundos || 0;
  const tempoRestanteIndividual = Math.max(
    0,
    tempoRestanteEmSegundos.value - penalidade
  );
  return formatarTempo(tempoRestanteIndividual);
}

function onConfirmDialog() {
  if (!aplicacao.value || !$websocket) return;
  const payload = { aplicacaoId: aplicacao.value.id };

  if (confirmAction.value === "finalizar") {
    console.log("Emitindo finalizar-aplicacao:", payload);
    $websocket.emit("finalizar-aplicacao", payload);
  } else if (confirmAction.value === "reiniciar") {
    console.log("Emitindo reiniciar-timer-aplicacao:", payload);
    $websocket.emit("reiniciar-timer-aplicacao", payload);
  }
  isConfirmOpen.value = false;
  confirmAction.value = null;
}

function handleViewSubmission(aluno: IProgressoAluno) {
  router.push(
    `/aplicacoes/aplicacao/${applicationId}/resultados/${aluno.submissaoId}`
  );
}
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
    <div class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />
      <p class="mt-4 text-lg text-gray-600">
        Carregando dados do monitoramento...
      </p>
    </div>
  </div>
  <div
    v-else-if="error"
    class="flex flex-col items-center justify-center min-h-[50vh] p-4"
  >
    <UAlert
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="Erro ao Carregar Monitoramento"
      :description="error"
      class="mb-4 max-w-md text-center"
    />
    <UButton @click="router.push('/aplicacoes')"
      >Voltar para Aplicações</UButton
    >
  </div>

  <div v-else-if="aplicacao && modeloDaAplicacao">
    <Breadcrumbs :items="breadcrumbs" />

    <MonitoringHeader
      :aplicacao="aplicacao"
      :timer="tempoRestanteFormatado"
      @ajustar-tempo="ajustarTempo"
      @finalizar="handleFinalizar"
      @pausar="handlePausar"
      @retomar="handleRetomar"
      @reiniciar="handleReiniciar"
    />
    <MonitoringStats :progresso-alunos="studentProgress" />
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <StudentProgressGrid
          :progresso-alunos="studentProgress"
          :get-tempo-restante="getTempoRestanteAlunoFormatado"
          @view-submission="handleViewSubmission"
        />
      </div>
      <div><ActivityFeed :atividades="activityFeed" /></div>
    </div>
    <ConfirmationDialog
      v-model="isConfirmOpen"
      :title="confirmTitle"
      :description="confirmDescription"
      :confirm-color="confirmColor"
      confirm-label="Confirmar"
      @confirm="onConfirmDialog"
    />
  </div>
  <div v-else class="flex items-center justify-center min-h-[50vh]">
    <UAlert
      icon="i-lucide-search-x"
      color="warning"
      variant="soft"
      title="Dados Não Encontrados"
      description="Não foi possível carregar os dados desta aplicação para monitoramento."
    />
  </div>
</template>
