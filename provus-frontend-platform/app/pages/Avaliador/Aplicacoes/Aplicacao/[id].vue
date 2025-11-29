<script setup lang="ts">
import Header from "@/components/Aplicacoes/AplicacoesHeader/index.vue";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import ViewConfigurationDialog from "~/components/Aplicacoes/Detalhes/ViewConfigurationDialog.vue";
import OverviewStats from "@/components/Aplicacoes/Detalhes/OverviewStats.vue";
import AnalysisGrid from "@/components/Aplicacoes/Detalhes/AnalysisGrid.vue";
import ViolationsTable from "@/components/Aplicacoes/Detalhes/ViolationsTable.vue";
import {
  mapAplicacaoApiResponseToEntity,
  useApplicationsStore,
} from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AplicacaoApiResponse } from "~/types/api/response/Aplicacao.response";
import ConfirmationDialog from "~/components/ui/ConfirmationDialog/index.vue";

interface EstadoAplicacaoPayload {
  aplicacaoId: number;
  novoEstado: EstadoAplicacaoEnum;
  novaDataFimISO: string;
}

const applicationsStore = useApplicationsStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const nuxtApp = useNuxtApp();

const isConfirmOpen = ref(false);
const confirmAction = ref<"finalizar" | "deletar" | null>(null);
const confirmTitle = ref("");
const confirmDescription = ref("");
const confirmColor = ref<"warning" | "error">("warning");

const $websocket = nuxtApp.$websocket as
  | ReturnType<typeof useWebSocket>
  | undefined;

const aplicacao = ref<AplicacaoEntity | null>(null);
const modeloDaAplicacao = computed<AvaliacaoEntity | null>(
  () => aplicacao.value?.avaliacao ?? null
);

const configuracaoParaExibir = computed<AvaliacaoEntity | null>(() => {
  if (!aplicacao.value || !modeloDaAplicacao.value) return null;

  const configUsada =
    aplicacao.value.configuracao || modeloDaAplicacao.value.configuracao;

  return {
    ...modeloDaAplicacao.value,
    configuracao: configUsada,
  };
});

const isLoadingData = ref(true);
const isConfigDialogOpen = ref(false);

const breadcrumbs = computed(() => [
  { label: "Aplicações", to: "/aplicacoes" },
  {
    label: aplicacao.value?.avaliacao.titulo ?? "Carregando...",
    disabled: true,
  },
]);

async function fetchApplicationDetails() {
  isLoadingData.value = true;
  aplicacao.value = null;
  const applicationId = parseInt(route.params.id as string, 10);

  if (isNaN(applicationId)) {
    toast.add({ title: "ID da Aplicação inválido.", color: "error" });
    router.push("/aplicacoes");
    isLoadingData.value = false;
    return;
  }

  try {
    const response = await nuxtApp.$api<AplicacaoApiResponse>(
      `/backoffice/aplicacao/${applicationId}`
    );
    const entity = mapAplicacaoApiResponseToEntity(response);
    aplicacao.value = entity;
    applicationsStore.updateApplicationData(applicationId, entity);
  } catch (error) {
    console.error("Erro ao buscar detalhes da aplicação:", error);
    const errorMessage = "Não foi possível carregar os detalhes da aplicação.";
    toast.add({
      title: "Erro ao Carregar",
      description: errorMessage,
      color: "error",
    });
    router.push("/aplicacoes");
  } finally {
    isLoadingData.value = false;
  }
}

function onEstadoAtualizado(data: EstadoAplicacaoPayload) {
  if (aplicacao.value && aplicacao.value.id === data.aplicacaoId) {
    console.log(`Atualizando estado da aplicação via WS: ${data.novoEstado}`);
    aplicacao.value.estado = data.novoEstado;
    if (data.novaDataFimISO) {
      aplicacao.value.dataFim = new Date(data.novaDataFimISO);
    }
    applicationsStore.updateApplicationData(data.aplicacaoId, {
      estado: data.novoEstado,
      dataFim: new Date(data.novaDataFimISO),
    });

    if (data.novoEstado === EstadoAplicacaoEnum.PAUSADA) {
      toast.add({
        title: "Aplicação Pausada",
        color: "warning",
        icon: "i-lucide-pause",
      });
    } else if (data.novoEstado === EstadoAplicacaoEnum.EM_ANDAMENTO) {
      toast.add({
        title: "Aplicação Retomada",
        color: "secondary",
        icon: "i-lucide-play",
      });
    } else if (data.novoEstado === EstadoAplicacaoEnum.FINALIZADA) {
      toast.add({
        title: "Aplicação Finalizada",
        color: "info",
        icon: "i-lucide-check-circle",
      });
    }
  }
}

onMounted(() => {
  fetchApplicationDetails();
  if ($websocket && $websocket.socket.value) {
    $websocket.on<EstadoAplicacaoPayload>(
      "estado-aplicacao-atualizado",
      onEstadoAtualizado
    );
  }
});

onUnmounted(() => {
  if ($websocket && $websocket.socket.value) {
    $websocket.socket.value.off(
      "estado-aplicacao-atualizado",
      onEstadoAtualizado
    );
  }
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId && !isNaN(parseInt(newId as string, 10))) {
      fetchApplicationDetails();
    }
  }
);

const podeIniciar = computed(
  () =>
    aplicacao.value?.estado === EstadoAplicacaoEnum.CRIADA ||
    aplicacao.value?.estado === EstadoAplicacaoEnum.AGENDADA
);
const podeMonitorar = computed(
  () =>
    aplicacao.value?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO ||
    aplicacao.value?.estado === EstadoAplicacaoEnum.PAUSADA
);
const podePausar = computed(
  () => aplicacao.value?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
);
const podeRetomar = computed(
  () => aplicacao.value?.estado === EstadoAplicacaoEnum.PAUSADA
);
const podeFinalizar = computed(
  () =>
    aplicacao.value?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO ||
    aplicacao.value?.estado === EstadoAplicacaoEnum.PAUSADA
);
const podeVerResultados = computed(
  () =>
    aplicacao.value?.estado === EstadoAplicacaoEnum.FINALIZADA ||
    aplicacao.value?.estado === EstadoAplicacaoEnum.CONCLUIDA
);
const podeDeletar = computed(
  () =>
    aplicacao.value?.estado !== EstadoAplicacaoEnum.EM_ANDAMENTO &&
    aplicacao.value?.estado !== EstadoAplicacaoEnum.PAUSADA
);

async function handleStartNow() {
  if (!aplicacao.value) return;
  await applicationsStore.updateApplicationStatus(
    aplicacao.value.id,
    EstadoAplicacaoEnum.EM_ANDAMENTO
  );
  router.push(`/aplicacoes/aplicacao/${aplicacao.value.id}/monitoramento`);
}

function handlePause() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    toast.add({ title: "Erro de Conexão WS", color: "error" });
    return;
  }
  $websocket.emit("pausar-aplicacao", { aplicacaoId: aplicacao.value.id });
}

function handleResume() {
  if (!$websocket || !$websocket.isConnected.value || !aplicacao.value) {
    toast.add({ title: "Erro de Conexão WS", color: "error" });
    return;
  }
  $websocket.emit("retomar-aplicacao", { aplicacaoId: aplicacao.value.id });
}

function handleFinish() {
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

function copyCode(code?: string) {
  if (code) {
    navigator.clipboard.writeText(code);
    toast.add({
      title: "Código copiado!",
      icon: "i-lucide-copy-check",
      color: "info",
    });
  }
}

const statusVisuals = computed(() => {
  const estado = aplicacao.value?.estado;
  if (estado === EstadoAplicacaoEnum.EM_ANDAMENTO)
    return { color: "secondary" as const };
  if (estado === EstadoAplicacaoEnum.PAUSADA)
    return { color: "warning" as const };
  if (
    estado === EstadoAplicacaoEnum.FINALIZADA ||
    estado === EstadoAplicacaoEnum.CONCLUIDA
  )
    return { color: "success" as const };
  if (estado === EstadoAplicacaoEnum.AGENDADA)
    return { color: "info" as const };
  if (estado === EstadoAplicacaoEnum.CRIADA)
    return { color: "primary" as const };
  if (estado === EstadoAplicacaoEnum.CANCELADA)
    return { color: "error" as const };
  return { color: "gray" as const };
});

async function handleDelete() {
  if (!aplicacao.value) return;
  confirmTitle.value = "Deletar Aplicação?";
  confirmDescription.value = `Tem certeza que deseja deletar a aplicação '${stripHtml(
    aplicacao.value.avaliacao.titulo
  )}'? Esta ação não pode ser desfeita.`;
  confirmAction.value = "deletar";
  confirmColor.value = "error";
  isConfirmOpen.value = true;
}

async function onConfirmDialog() {
  if (!aplicacao.value) return;
  if (confirmAction.value === "deletar") {
    isLoadingData.value = true;
    await applicationsStore.deleteApplication(aplicacao.value.id);
    isLoadingData.value = false;
    router.push("/aplicacoes");
  } else if (confirmAction.value === "finalizar") {
    if (!$websocket || !$websocket.isConnected.value) {
      toast.add({ title: "Erro de Conexão WS", color: "error" });
      return;
    }
    $websocket.emit("finalizar-aplicacao", { aplicacaoId: aplicacao.value.id });
  }
  isConfirmOpen.value = false;
  confirmAction.value = null;
}
</script>

<template>
  <div v-if="isLoadingData" class="text-center p-8">
    <Icon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-primary" />
    <p class="text-gray-500 mt-2">Carregando dados da aplicação...</p>
  </div>

  <div v-else-if="aplicacao && modeloDaAplicacao">
    <Breadcrumbs :items="breadcrumbs" />
    <Header
      :titulo="modeloDaAplicacao.titulo"
      :descricao="modeloDaAplicacao.descricao"
      :data-aplicacao="aplicacao.dataInicio.toISOString()"
    />

    <UCard class="mb-8">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div class="flex items-center space-x-2">
          <span class="font-medium text-gray-700">Status:</span>
          <UBadge :color="statusVisuals.color" variant="subtle" size="lg">{{
            aplicacao.estado
          }}</UBadge>
        </div>
        <div v-if="aplicacao.codigoAcesso" class="flex items-center space-x-2">
          <span class="font-medium text-gray-700">Código de Acesso:</span>
          <UBadge
            color="primary"
            variant="solid"
            size="lg"
            class="tracking-widest"
            >{{ aplicacao.codigoAcesso }}</UBadge
          >
          <UButton
            icon="i-lucide-copy"
            size="sm"
            variant="ghost"
            @click="copyCode(aplicacao.codigoAcesso)"
          />
        </div>
        <UButton
          label="Ver Configuração"
          icon="i-lucide-settings-2"
          variant="outline"
          color="primary"
          @click="isConfigDialogOpen = true"
        />
      </div>
    </UCard>

    <UCard class="mb-8">
      <template #header
        ><h3 class="text-lg font-medium">Ações Rápidas</h3></template
      >
      <div class="flex flex-wrap gap-3">
        <UButton
          v-if="podeIniciar"
          label="Iniciar Agora"
          icon="i-lucide-play"
          color="secondary"
          size="md"
          @click="handleStartNow"
        />
        <UButton
          v-if="podeMonitorar"
          label="Monitorar"
          icon="i-lucide-activity"
          size="md"
          :to="`/aplicacoes/aplicacao/${aplicacao.id}/monitoramento`"
        />
        <UButton
          v-if="podePausar"
          label="Pausar Aplicação"
          icon="i-lucide-pause"
          color="warning"
          size="md"
          @click="handlePause"
        />
        <UButton
          v-if="podeRetomar"
          label="Retomar Aplicação"
          icon="i-lucide-play"
          color="secondary"
          size="md"
          @click="handleResume"
        />
        <UButton
          v-if="podeFinalizar"
          label="Finalizar Aplicação"
          icon="i-lucide-stop-circle"
          color="primary"
          size="md"
          @click="handleFinish"
        />
        <UButton
          v-if="podeVerResultados"
          label="Ver Resultados"
          icon="i-lucide-bar-chart-3"
          color="secondary"
          size="md"
          :to="`/aplicacoes/aplicacao/${aplicacao.id}/resultados`"
        />
        <UButton
          v-if="podeDeletar"
          label="Deletar Aplicação"
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          size="md"
          @click="handleDelete"
        />
      </div>
    </UCard>

    <OverviewStats v-if="aplicacao.stats" :stats="aplicacao.stats" />
    <AnalysisGrid v-if="aplicacao.stats" :stats="aplicacao.stats" />
    <ViolationsTable
      v-if="aplicacao.violations && aplicacao.violations.length > 0"
      :violations="aplicacao.violations"
    />

    <UAlert
      v-else-if="
        !isLoadingData &&
        (!aplicacao.violations || aplicacao.violations.length === 0)
      "
      icon="i-lucide-shield-check"
      title="Nenhuma Violação Registrada"
      variant="subtle"
      class="mb-8"
    />

    <ViewConfigurationDialog
      v-model="isConfigDialogOpen"
      :configuracao="configuracaoParaExibir"
    />

    <ConfirmationDialog
      v-model="isConfirmOpen"
      :title="confirmTitle"
      :description="confirmDescription"
      :confirm-label="
        confirmAction === 'deletar' ? 'Sim, deletar' : 'Sim, finalizar'
      "
      :confirm-color="confirmColor"
      @confirm="onConfirmDialog"
    />
  </div>

  <div v-else class="text-center p-8">
    <p class="text-red-500 font-medium">
      Não foi possível carregar os dados da aplicação.
    </p>
    <UButton variant="link" to="/aplicacoes" class="mt-4"
      >Voltar para Aplicações</UButton
    >
  </div>
</template>
