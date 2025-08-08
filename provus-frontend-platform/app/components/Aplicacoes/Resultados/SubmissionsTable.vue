<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { ISubmissao, ISubmissaoResponse } from "~/types/ISubmissao";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

const UBadge = resolveComponent("UBadge");
const UAvatar = resolveComponent("UAvatar");
const UButton = resolveComponent("UButton");

const props = defineProps<{
  submissions: ISubmissaoResponse;
  isLoading: boolean;
}>();

const router = useRouter();

type SubmissionRow = ISubmissao & {
  tempoGasto: string;
  tempoGastoEmMinutos: number;
};

const data = computed<SubmissionRow[]>(() => {
  return props.submissions.submissoes.map((sub) => {
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
});

const table = useTemplateRef("table");
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const columns: TableColumn<SubmissionRow>[] = [
  {
    accessorKey: "aluno.nome",
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
      const aluno = row.original.aluno;
      return h("div", { class: "flex items-center space-x-3" }, [
        h(UAvatar, { alt: aluno.nome, size: "md" }),
        h("div", null, [
          h("div", { class: "font-medium text-gray-900" }, aluno.nome),
          h("div", { class: "text-sm text-gray-500" }, aluno.email),
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
      const pontuacaoAluno = row.original.pontuacaoTotal || 0;
      const pontuacaoTotalProva = props.submissions.pontuacaoTotal || 1;
      const percentual = ((pontuacaoAluno / pontuacaoTotalProva) * 100).toFixed(
        1
      );
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
        [EstadoSubmissaoEnum.AVALIADA]: "secondary",
        [EstadoSubmissaoEnum.ENVIADA]: "primary",
        [EstadoSubmissaoEnum.INICIADA]: "yellow",
        [EstadoSubmissaoEnum.ABANDONADA]: "error",
        [EstadoSubmissaoEnum.ENCERRADA]: "gray",
        [EstadoSubmissaoEnum.REABERTA]: "orange",
      };
      return h(
        UBadge,
        { color: colorMap[estado] || "gray", variant: "subtle" },
        () => estado
      );
    },
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
      :data="data"
      :columns="columns"
      :loading="isLoading"
      class="flex-1"
      @select="onSelect"
    />

    <div
      v-if="table && data.length > 0"
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
