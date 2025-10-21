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
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AplicacaoApiResponse } from "~/types/api/response/Aplicacao.response";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import { useTimer } from "~/composables/useTimer";

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

const applicationId = parseInt(route.params.id as string, 10);
const aplicacao = ref<AplicacaoEntity | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const modeloDaAplicacao = computed<AvaliacaoEntity | null>(() => {
  return aplicacao.value?.avaliacao ?? null;
});

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
      aplicacao.value = entity;
      applicationsStore.updateApplicationData(applicationId, entity);
      console.log(
        `Monitoramento.vue: Aplicação ${applicationId} carregada da API.`
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

onMounted(async () => {
  console.log("Monitoramento.vue: onMounted - Iniciando.");
  isLoading.value = true;
  error.value = null;
  monitoringStore.clearWebSocketListeners();
  monitoringStore.currentApplicationId = applicationId;

  aplicacao.value = applicationsStore.getApplicationById(applicationId) ?? null;

  const appLoadSuccess = await fetchApplicationIfNeeded();

  if (appLoadSuccess) {
    await fetchMonitoringDetails();
  }

  isLoading.value = false;

  if ($websocket) {
    watch(
      $websocket.isConnected,
      (connected) => {
        if (connected && !monitoringStore.listenersInitialized) {
          console.log(
            "Monitoramento.vue: Watch detectou conexão, inicializando listeners (se necessário)."
          );
          monitoringStore.initializeWebSocketListeners();
        } else if (!connected) {
          console.log("Monitoramento.vue: Watch detectou desconexão.");
          monitoringStore.clearWebSocketListeners();
        }
      },
      { immediate: $websocket.isConnected.value }
    );
  } else {
    console.error(
      "Monitoramento.vue: onMounted - $websocket não está disponível."
    );
  }
});

onUnmounted(() => {
  console.log("Monitoramento.vue: onUnmounted - Limpando listeners e AppID.");
  monitoringStore.clearWebSocketListeners();
  monitoringStore.currentApplicationId = null;
});

function handleFinalizar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    console.warn("WS não conectado ou aplicação não carregada.");
    toast.add({
      title: "Erro de Conexão",
      description: "Verifique sua conexão WebSocket.",
      color: "error",
    });
    return;
  }
  if (
    confirm(
      "Tem certeza que deseja finalizar esta aplicação para todos os alunos?"
    )
  ) {
    const payload = { aplicacaoId: aplicacao.value.id };
    console.log("Emitindo finalizar-aplicacao:", payload);
    $websocket.emit("finalizar-aplicacao", payload);
  }
}

function handlePausar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    console.warn("WS não conectado ou aplicação não carregada.");
    toast.add({
      title: "Erro de Conexão",
      description: "Verifique sua conexão WebSocket.",
      color: "error",
    });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo pausar-aplicacao:", payload);
  $websocket.emit("pausar-aplicacao", payload);
}

function handleRetomar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    console.warn("WS não conectado ou aplicação não carregada.");
    toast.add({
      title: "Erro de Conexão",
      description: "Verifique sua conexão WebSocket.",
      color: "error",
    });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo retomar-aplicacao:", payload);
  $websocket.emit("retomar-aplicacao", payload);
}

function ajustarTempo(segundos: number) {
  if (!$websocket || !$websocket.isConnected.value) {
    console.warn("WebSocket não conectado. Não é possível ajustar o tempo.");
    toast.add({
      title: "Erro de Conexão",
      description: "Não foi possível ajustar o tempo. Verifique sua conexão.",
      color: "error",
      icon: "i-lucide-wifi-off",
    });
    return;
  }
  if (!aplicacao.value) {
    console.warn(
      "Dados da aplicação não carregados. Não é possível ajustar o tempo."
    );
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id, segundos: segundos };
  console.log("Emitindo ajustar-tempo-aplicacao:", payload);
  $websocket.emit("ajustar-tempo-aplicacao", payload);
}

function handleReiniciar() {
  if (!$websocket || !$websocket.isConnected.value) {
    console.warn("WebSocket não conectado. Não é possível reiniciar o timer.");
    toast.add({
      title: "Erro de Conexão",
      description: "Não foi possível reiniciar o timer. Verifique sua conexão.",
      color: "error",
      icon: "i-lucide-wifi-off",
    });
    return;
  }
  if (!aplicacao.value) {
    console.warn(
      "Dados da aplicação não carregados. Não é possível reiniciar o timer."
    );
    return;
  }
  const confirma = confirm(
    "Tem certeza que deseja reiniciar o timer para TODOS os alunos nesta aplicação? O tempo será recalculado a partir de agora com a duração original."
  );
  if (!confirma) return;
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo reiniciar-timer-aplicacao:", payload);
  $websocket.emit("reiniciar-timer-aplicacao", payload);
}

function getTempoRestanteAlunoFormatado(aluno: IProgressoAluno): string {
  const penalidade = aluno.tempoPenalidadeEmSegundos || 0;
  const tempoRestanteIndividual = Math.max(
    0,
    tempoRestanteEmSegundos.value - penalidade
  );

  if (!isApplicationActive.value || tempoRestanteIndividual <= 0)
    return "00:00:00";

  const horas = Math.floor(tempoRestanteIndividual / 3600)
    .toString()
    .padStart(2, "0");
  const minutos = Math.floor((tempoRestanteIndividual % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const segundos = Math.floor(tempoRestanteIndividual % 60)
    .toString()
    .padStart(2, "0");

  return `${horas}:${minutos}:${segundos}`;
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
    <Breadcrumbs :aplicacao="aplicacao" level="monitoring" />
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
        />
      </div>

      <div><ActivityFeed :atividades="activityFeed" /></div>
    </div>
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
