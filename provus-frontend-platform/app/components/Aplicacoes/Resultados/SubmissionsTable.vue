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

const UBadge = resolveComponent("UBadge");
const UAvatar = resolveComponent("UAvatar");
const UButton = resolveComponent("UButton");
const props = defineProps<{
  submissions: FindSubmissoesResponse;
  isLoading: boolean;
  searchFilter: string;
  statusFilter: EstadoSubmissaoEnum | "Todos";
}>();
const router = useRouter();

type SubmissionRow = SubmissaoNaListaResponse & {
  tempoGasto: string;
  tempoGastoEmMinutos: number;
};

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

const codigoAConfirmar = ref<{
  submissaoId: number | null;
  codigo: string;
  isLoading: boolean;
}>({
  submissaoId: null,
  codigo: "",
  isLoading: false,
});

function openPopover(row: SubmissionRow) {
  codigoAConfirmar.value.submissaoId = row.id;
  codigoAConfirmar.value.codigo = "";
  codigoAConfirmar.value.isLoading = false;
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
    codigoAConfirmar.value = {
      submissaoId: null,
      codigo: "",
      isLoading: false,
    };
    const popoverButton = document.getElementById(
      `popover-btn-${submissao.id}`
    );
    popoverButton?.click();
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

const table = useTemplateRef("table");
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
const columns: TableColumn<SubmissionRow>[] = [
  {
    accessorKey: "estudante.nome",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        label: "Aluno",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const estudante = row.original.estudante;
      return h("div", { class: "flex items-center space-x-3" }, [
        h(UAvatar, { alt: estudante.nome, size: "md" }),
        h("div", null, [
          h("div", { class: "font-medium text-gray-900" }, estudante.nome),
          h("div", { class: "text-sm text-gray-500" }, estudante.email),
        ]),
      ]);
    },
  },
  {
    accessorKey: "pontuacaoTotal",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        label: "Nota",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const pontuacaoAluno = Number(row.original.pontuacaoTotal) || 0;
      const pontuacaoTotalProva = Number(props.submissions.pontuacaoTotal) || 1;

      const percentual =
        pontuacaoTotalProva > 0
          ? ((pontuacaoAluno / pontuacaoTotalProva) * 100).toFixed(1)
          : "0.0";

      const corNota =
        pontuacaoAluno / pontuacaoTotalProva >= 0.8
          ? "text-secondary"
          : pontuacaoAluno / pontuacaoTotalProva >= 0.6
          ? "text-orange-500"
          : "text-red-500";

      return h("div", { class: "flex items-center space-x-2" }, [
        h("span", { class: `text-xl font-bold ${corNota}` }, `${percentual}%`),
        h(
          "span",
          { class: "text-sm text-gray-500" },
          `(${pontuacaoAluno.toFixed(1)}/${pontuacaoTotalProva})`
        ),
      ]);
    },
  },
  {
    accessorKey: "tempoGastoEmMinutos",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        label: "Tempo",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => row.original.tempoGasto,
  },
  {
    accessorKey: "finalizadoEm",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        label: "Enviado em",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) =>
      row.original.finalizadoEm
        ? new Date(row.original.finalizadoEm).toLocaleString("pt-BR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
  },
  {
    accessorKey: "estado",
    header: "Status",
    cell: ({ row }) => {
      const estado = row.original.estado;
      const colorMap: Record<string, string> = {
        [EstadoSubmissaoEnum.CODIGO_CONFIRMADO]: "secondary",
        [EstadoSubmissaoEnum.AVALIADA]: "primary",
        [EstadoSubmissaoEnum.ENVIADA]: "blue",
        [EstadoSubmissaoEnum.INICIADA]: "yellow",
        [EstadoSubmissaoEnum.ABANDONADA]: "error",
        [EstadoSubmissaoEnum.ENCERRADA]: "gray",
        [EstadoSubmissaoEnum.REABERTA]: "orange",
      };

      const textoEstado =
        estado === EstadoSubmissaoEnum.AVALIADA
          ? "Avaliada (Não Confirmada)"
          : estado === EstadoSubmissaoEnum.ENVIADA
          ? "Enviada (Não Confirmada)"
          : estado;

      return h(
        UBadge,
        { color: colorMap[estado] || "gray", variant: "subtle" },
        () => textoEstado
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Confirmação",
  },
];

const sorting = ref([
  {
    id: "pontuacaoTotal",
    desc: true,
  },
]);

function onSelect(row: TableRow<SubmissionRow>) {
  router.push(
    `/aplicacoes/aplicacao/${props.submissions.applicationId}/resultados/${row.original.id}`
  );
}
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
      <template #actions="{ row }">
        <UBadge
          v-if="row.original.estado === EstadoSubmissaoEnum.CODIGO_CONFIRMADO"
          color="secondary"
          variant="solid"
          size="xs"
        >
          Confirmado
        </UBadge>

        <UPopover
          v-else-if="
            row.original.estado === EstadoSubmissaoEnum.AVALIADA ||
            row.original.estado === EstadoSubmissaoEnum.ENVIADA
          "
          mode="click"
        >
          <UButton
            :id="`popover-btn-${row.original.id}`"
            label="Confirmar"
            size="xs"
            color="warning"
            variant="outline"
            @click.stop="openPopover(row.original)"
          />

          <template #content>
            <div class="p-4 w-64 space-y-3" @click.stop>
              <p class="text-sm font-medium">
                Confirmar: {{ row.original.estudante.nome }}
              </p>
              <UInput
                v-model="codigoAConfirmar.codigo"
                placeholder="Código de 6 dígitos"
                maxlength="6"
              />
              <UButton
                label="OK"
                size="sm"
                block
                :loading="
                  codigoAConfirmar.isLoading &&
                  codigoAConfirmar.submissaoId === row.original.id
                "
                @click.stop="handleConfirmarCodigo(row.original)"
              />
            </div>
          </template>
        </UPopover>

        <span v-else class="text-gray-400">N/A</span>
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
        @update:model-value="(p: number) => table?.tableApi.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
