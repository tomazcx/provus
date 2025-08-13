<script setup lang="ts">
import MonitoringHeader from "~/components/Monitoramento/MonitoramentoHeader/index.vue";
import MonitoringStats from "~/components/Monitoramento/MonitoramentoStats/index.vue";
import StudentProgressGrid from "~/components/Monitoramento/StudentProgressGrid/index.vue";
import ActivityFeed from "~/components/Monitoramento/ActivityFeed/index.vue";
import Breadcrumbs from "~/components/Breadcrumbs/index.vue";

import { useMonitoringStore } from "~/store/monitoringStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { IProgressoAluno } from "~/types/IMonitoring";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

const route = useRoute();
const monitoringStore = useMonitoringStore();
const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();

const applicationId = parseInt(route.params.id as string, 10);

const aplicacao = computed(() =>
  applicationsStore.getApplicationById(applicationId)
);

const isApplicationActive = computed(
  () => aplicacao.value?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
);

const studentProgress = computed(() => monitoringStore.studentProgress);
const activityFeed = computed(() => monitoringStore.activityFeed);

const modelo = computed(() =>
  aplicacao.value
    ? examBankStore.getItemById(aplicacao.value.avaliacaoModeloId)
    : null
);

const dataAplicacaoRef = computed(() => aplicacao.value?.dataAplicacao);
const tempoMaximoRef = computed(() => modelo.value?.configuracoes.tempoMaximo);
const ajusteTempoRef = computed(() => aplicacao.value?.ajusteDeTempoEmSegundos);

const { tempoRestanteFormatado, tempoRestanteEmSegundos } = useTimer({
  dataAplicacao: dataAplicacaoRef,
  tempoMaximoEmMinutos: tempoMaximoRef,
  ajusteDeTempoEmSegundos: ajusteTempoRef,
  isActive: isApplicationActive,
});

function handleFinalizar() {
  if (aplicacao.value) {
    applicationsStore.updateApplicationStatus(
      aplicacao.value.id,
      EstadoAplicacaoEnum.FINALIZADA
    );
  }
}

function handlePausar() {
  if (aplicacao.value) {
    applicationsStore.updateApplicationStatus(
      aplicacao.value.id,
      EstadoAplicacaoEnum.PAUSADA
    );
  }
}

function handleRetomar() {
  if (aplicacao.value) {
    applicationsStore.updateApplicationStatus(
      aplicacao.value.id,
      EstadoAplicacaoEnum.EM_ANDAMENTO
    );
  }
}

function ajustarTempo(segundos: number) {
  if (aplicacao.value) {
    applicationsStore.ajustarTempoAplicacao(aplicacao.value.id, segundos);
  }
}

function handleReiniciar() {
  if (aplicacao.value) {
    applicationsStore.reiniciarTimerAplicacao(aplicacao.value.id);
  }
}

function getTempoRestanteAlunoFormatado(aluno: IProgressoAluno) {
  const penalidade = aluno.tempoPenalidadeEmSegundos || 0;

  const tempoRestanteIndividual = tempoRestanteEmSegundos.value - penalidade;

  if (tempoRestanteIndividual <= 0) return "00:00:00";
  const horas = Math.floor(tempoRestanteIndividual / 3600)
    .toString()
    .padStart(2, "0");
  const minutos = Math.floor((tempoRestanteIndividual % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (tempoRestanteIndividual % 60).toString().padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
}

onMounted(async () => {
  await applicationsStore.fetchItems();
  await examBankStore.fetchItems();
  await monitoringStore.fetchMonitoringData(applicationId);

  monitoringStore.startSimulation();
});

onUnmounted(() => {
  monitoringStore.stopSimulation();
});
</script>

<template>
  <div v-if="aplicacao">
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
