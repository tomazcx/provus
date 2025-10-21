<script setup lang="ts">
import MonitoringHeader from "~/components/Monitoramento/MonitoramentoHeader/index.vue";
import MonitoringStats from "~/components/Monitoramento/MonitoramentoStats/index.vue";
import StudentProgressGrid from "~/components/Monitoramento/StudentProgressGrid/index.vue";
import ActivityFeed from "~/components/Monitoramento/ActivityFeed/index.vue";

import { useMonitoringStore } from "~/store/monitoringStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { IProgressoAluno } from "~/types/IMonitoring";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";

const route = useRoute();
const monitoringStore = useMonitoringStore();
const applicationsStore = useApplicationsStore();
const toast = useToast();

const applicationId = parseInt(route.params.id as string, 10);

const aplicacao = computed(() =>
  applicationsStore.getApplicationById(applicationId)
);

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
const nuxtApp = useNuxtApp();

const $websocket = nuxtApp.$websocket as
  | ReturnType<typeof useWebSocket>
  | undefined;

const { tempoRestanteFormatado, tempoRestanteEmSegundos } = useTimer({
  dataFimISO: dataFimRef,
  isActive: isApplicationActive,
});

function handleFinalizar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    console.warn("WS não conectado ou aplicação não carregada.");
    toast.add({ title: "Erro de Conexão", color: "error" });
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
    toast.add({ title: "Erro de Conexão", color: "error" });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo pausar-aplicacao:", payload);
  $websocket.emit("pausar-aplicacao", payload);
}

function handleRetomar() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    console.warn("WS não conectado ou aplicação não carregada.");
    toast.add({ title: "Erro de Conexão", color: "error" });
    return;
  }
  const payload = { aplicacaoId: aplicacao.value.id };
  console.log("Emitindo retomar-aplicacao:", payload);
  $websocket.emit("retomar-aplicacao", payload);
}

function ajustarTempo(segundos: number) {
  if (!$websocket || !$websocket.isConnected.value) {
    console.warn("WebSocket não conectado. Não é possível ajustar o tempo.");

    const toast = useToast();

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

  const payload = {
    aplicacaoId: aplicacao.value.id,
    segundos: segundos,
  };

  console.log("Emitindo ajustar-tempo-aplicacao:", payload);
  $websocket.emit("ajustar-tempo-aplicacao", payload);
}

function handleReiniciar() {
  if (!$websocket || !$websocket.isConnected.value) {
    console.warn("WebSocket não conectado. Não é possível reiniciar o timer.");
    const toast = useToast();
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
  if (!confirma) {
    return;
  }

  const payload = {
    aplicacaoId: aplicacao.value.id,
  };

  console.log("Emitindo reiniciar-timer-aplicacao:", payload);
  $websocket.emit("reiniciar-timer-aplicacao", payload);
}

function getTempoRestanteAlunoFormatado(aluno: IProgressoAluno): string {
  const penalidade = aluno.tempoPenalidadeEmSegundos || 0;
  const tempoRestanteIndividual = Math.max(
    0,
    tempoRestanteEmSegundos.value - penalidade
  );

  if (tempoRestanteIndividual <= 0) return "00:00:00";

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

onMounted(async () => {
  console.log("Monitoramento.vue: onMounted - Iniciando.");
  monitoringStore.clearWebSocketListeners();
  monitoringStore.currentApplicationId = applicationId;

  await monitoringStore.fetchMonitoringData(applicationId);

  if ($websocket?.isConnected?.value) {
    console.log(
      "Monitoramento.vue: onMounted - WS já conectado, inicializando listeners."
    );
    monitoringStore.initializeWebSocketListeners();
  } else {
    console.log(
      "Monitoramento.vue: onMounted - WS não conectado ainda, aguardando watch."
    );
  }

  watch(
    () => $websocket?.isConnected?.value,
    (connected) => {
      if (connected) {
        console.log(
          "Monitoramento.vue: Watch detectou conexão, inicializando listeners (se necessário)."
        );
        monitoringStore.initializeWebSocketListeners();
      } else {
        console.log("Monitoramento.vue: Watch detectou desconexão.");
      }
    },
    { immediate: false }
  );
});

onUnmounted(() => {
  console.log("Monitoramento.vue: onUnmounted - Limpando listeners e AppID.");
  monitoringStore.clearWebSocketListeners();
  monitoringStore.currentApplicationId = null;
});

watch(
  studentProgress,
  (newProgress) => {
    console.log(
      "%%% Página Monitoramento: studentProgress mudou!",
      JSON.stringify(newProgress)
    );
  },
  { deep: true }
);
</script>

<template>
  <div v-if="aplicacao && modeloDaAplicacao">
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
      <div>
        <ActivityFeed :atividades="activityFeed" />
      </div>
    </div>
  </div>
  <div v-else class="text-center p-8">
    <p class="text-gray-500">Carregando dados do monitoramento...</p>
  </div>
</template>
