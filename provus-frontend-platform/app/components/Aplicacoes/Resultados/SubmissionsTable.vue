<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui";
import type {
  FindSubmissoesResponse,
  SubmissaoNaListaResponse,
} from "~/types/api/response/FindSubmissoes.response";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import { useSubmissionsStore } from "~/store/submissionStore";

const toast = useToast();
const { $api } = useNuxtApp();
const submissionsStore = useSubmissionsStore();
const router = useRouter();

const props = defineProps<{
  submissions: FindSubmissoesResponse;
  isLoading: boolean;
  searchFilter: string;
  statusFilter: EstadoSubmissaoEnum | "Todos";
}>();

type SubmissionRow = SubmissaoNaListaResponse & {
  tempoGasto: string;
  tempoGastoEmMinutos: number;
};

const columns: TableColumn<SubmissionRow>[] = [
  {
    accessorKey: "estudante.nome",
    header: "Aluno",
    id: "estudante",
  },
  {
    accessorKey: "pontuacaoTotal",
    header: "Nota",
    id: "pontuacaoTotal",
  },
  {
    accessorKey: "tempoGastoEmMinutos",
    header: "Tempo",
    id: "tempoGastoEmMinutos",
  },
  {
    accessorKey: "finalizadoEm",
    header: "Enviado em",
    id: "finalizadoEm",
  },
  {
    accessorKey: "estado",
    header: "Status",
    id: "estado",
  },
  {
    id: "actions",
    header: "Confirmação",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const sorting = ref([
  {
    id: "pontuacaoTotal",
    desc: true,
  },
]);

const codigoAConfirmar = ref<{
  submissaoId: number | null;
  codigo: string;
  isLoading: boolean;
}>({
  submissaoId: null,
  codigo: "",
  isLoading: false,
});

const filteredData = computed<SubmissionRow[]>(() => {
  let filtered = props.submissions.submissoes.map((sub) => {
    const inicio = sub.iniciadoEm ? new Date(sub.iniciadoEm) : null;
    const fim = sub.finalizadoEm ? new Date(sub.finalizadoEm) : null;
    let tempoGasto = "-";
    let tempoGastoEmMinutos = 0;

    if (inicio && fim) {
      const diffMinutos = Math.round(
        (fim.getTime() - inicio.getTime()) / 60000
      );
      tempoGasto = `${diffMinutos} minutos`;
      tempoGastoEmMinutos = diffMinutos;
    }

    return {
      ...sub,
      tempoGasto: tempoGasto,
      tempoGastoEmMinutos: tempoGastoEmMinutos,
    };
  });

  if (props.searchFilter) {
    const searchTerm = props.searchFilter.toLowerCase();
    filtered = filtered.filter(
      (sub) =>
        sub.estudante.nome.toLowerCase().includes(searchTerm) ||
        sub.estudante.email.toLowerCase().includes(searchTerm)
    );
  }

  if (props.statusFilter !== "Todos") {
    filtered = filtered.filter((sub) => sub.estado === props.statusFilter);
  }

  return filtered;
});

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("pt-BR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPercentual(pontuacaoTotal: number | null) {
  const pontuacaoAluno = Number(pontuacaoTotal) || 0;
  const pontuacaoTotalProva = Number(props.submissions.pontuacaoTotal) || 1;
  return pontuacaoTotalProva > 0
    ? ((pontuacaoAluno / pontuacaoTotalProva) * 100).toFixed(1)
    : "0.0";
}

function getCorNota(pontuacaoTotal: number | null): string {
  const pontuacaoAluno = Number(pontuacaoTotal) || 0;
  const pontuacaoTotalProva = Number(props.submissions.pontuacaoTotal) || 1;
  const ratio = pontuacaoAluno / pontuacaoTotalProva;

  if (ratio >= 0.8) return "text-secondary";
  if (ratio >= 0.6) return "text-orange-500";
  return "text-red-500";
}

function getStatusColor(estado: EstadoSubmissaoEnum): string {
  const colorMap: Record<string, string> = {
    [EstadoSubmissaoEnum.CODIGO_CONFIRMADO]: "secondary",
    [EstadoSubmissaoEnum.AVALIADA]: "primary",
    [EstadoSubmissaoEnum.ENVIADA]: "blue",
    [EstadoSubmissaoEnum.INICIADA]: "yellow",
    [EstadoSubmissaoEnum.ABANDONADA]: "error",
    [EstadoSubmissaoEnum.ENCERRADA]: "gray",
    [EstadoSubmissaoEnum.REABERTA]: "orange",
  };
  return colorMap[estado] || "gray";
}

function getStatusText(estado: EstadoSubmissaoEnum): string {
  if (estado === EstadoSubmissaoEnum.AVALIADA)
    return "Avaliada (Não Confirmada)";
  if (estado === EstadoSubmissaoEnum.ENVIADA) return "Enviada (Não Confirmada)";
  return estado;
}

function togglePopover(submissaoId: number) {
  if (codigoAConfirmar.value.submissaoId === submissaoId) {
    codigoAConfirmar.value.submissaoId = null;
  } else {
    codigoAConfirmar.value.submissaoId = submissaoId;
    codigoAConfirmar.value.codigo = "";
    codigoAConfirmar.value.isLoading = false;
  }
}

async function handleConfirmarCodigo(submissao: SubmissionRow) {
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

  try {
    const payload = {
      codigoEntrega: parseInt(codigoAConfirmar.value.codigo, 10),
    };

    await $api(
      `/backoffice/aplicacao/${props.submissions.applicationId}/submissao/${submissao.id}/confirmar-codigo`,
      { method: "PATCH", body: payload }
    );

    submissionsStore.updateSubmissionStatus(
      submissao.id,
      EstadoSubmissaoEnum.CODIGO_CONFIRMADO
    );

    toast.add({ title: "Entrega Confirmada!", color: "secondary" });
    codigoAConfirmar.value.submissaoId = null;
    codigoAConfirmar.value.codigo = "";
  } catch {
    toast.add({
      title: "Erro na confirmação",
      description: "Código incorreto.",
      color: "error",
    });
  } finally {
    codigoAConfirmar.value.isLoading = false;
  }
}

function onSelect(row: TableRow<SubmissionRow>) {
  const submissionId = "original" in row ? row.original.id : row.id;
  router.push(
    `/aplicacoes/aplicacao/${props.submissions.applicationId}/resultados/${submissionId}`
  );
}

const table = useTemplateRef("table");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:sorting="sorting"
      :data="filteredData"
      :columns="columns"
      :loading="isLoading"
      class="flex-1"
      @select="onSelect"
    >
      <template #estudante-cell="{ row }">
        <div class="flex items-center space-x-3">
          <UAvatar :alt="row.original.estudante.nome" size="md" />
          <div>
            <div class="font-medium text-gray-900">
              {{ row.original.estudante.nome }}
            </div>
            <div class="text-sm text-gray-500">
              {{ row.original.estudante.email }}
            </div>
          </div>
        </div>
      </template>

      <template #pontuacaoTotal-cell="{ row }">
        <div class="flex items-center space-x-2">
          <span
            class="text-xl font-bold"
            :class="getCorNota(row.original.pontuacaoTotal)"
          >
            {{ getPercentual(row.original.pontuacaoTotal) }}%
          </span>
          <span class="text-sm text-gray-500">
            ({{ (Number(row.original.pontuacaoTotal) || 0).toFixed(1) }}/{{
              submissions.pontuacaoTotal
            }})
          </span>
        </div>
      </template>

      <template #tempoGastoEmMinutos-cell="{ row }">
        {{ row.original.tempoGasto }}
      </template>

      <template #finalizadoEm-cell="{ row }">
        {{ formatDate(row.original.finalizadoEm) }}
      </template>

      <template #estado-cell="{ row }">
        <UBadge :color="getStatusColor(row.original.estado)" variant="subtle">
          {{ getStatusText(row.original.estado) }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div @click.stop>
          <div
            v-if="row.original.estado === EstadoSubmissaoEnum.CODIGO_CONFIRMADO"
          >
            <UBadge color="secondary" variant="solid" size="xs"
              >Confirmado</UBadge
            >
          </div>

          <div
            v-else-if="
              row.original.estado === EstadoSubmissaoEnum.AVALIADA ||
              row.original.estado === EstadoSubmissaoEnum.ENVIADA
            "
          >
            <UPopover
              mode="click"
              :open="codigoAConfirmar.submissaoId === row.original.id"
              @update:open="
                (val) => {
                  if (
                    !val &&
                    codigoAConfirmar.submissaoId === row.original.id
                  ) {
                    codigoAConfirmar.submissaoId = null;
                  }
                }
              "
            >
              <UButton
                label="Confirmar"
                size="xs"
                color="warning"
                variant="outline"
                @click="togglePopover(row.original.id)"
              />

              <template #panel>
                <div class="p-4 w-64 space-y-3" @click.stop>
                  <p class="text-sm font-medium">
                    Confirmar: {{ row.original.estudante.nome }}
                  </p>
                  <UInput
                    v-model="codigoAConfirmar.codigo"
                    placeholder="Código de 6 dígitos"
                    maxlength="6"
                    :disabled="codigoAConfirmar.isLoading"
                    autofocus
                  />
                  <UButton
                    label="OK"
                    size="sm"
                    block
                    :loading="codigoAConfirmar.isLoading"
                    @click="handleConfirmarCodigo(row.original)"
                  />
                </div>
              </template>
            </UPopover>
          </div>

          <span v-else class="text-gray-400">N/A</span>
        </div>
      </template>
    </UTable>

    <div
      v-if="table && filteredData.length > 0"
      class="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <UPagination
        :model-value="
          (table?.tableApi.getState().pagination.pageIndex || 0) + 1
        "
        :page-count="table?.tableApi.getState().pagination.pageSize"
        :total="table?.tableApi.getFilteredRowModel().rows.length"
        @update:model-value="
          (p: number) => table?.tableApi.setPageIndex(p - 1)
        "
      />
    </div>
  </div>
</template>
