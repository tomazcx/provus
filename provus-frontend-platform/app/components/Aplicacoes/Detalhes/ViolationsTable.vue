<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { AplicacaoViolationEntity } from "~/types/entities/Aplicacao.entity";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

defineProps<{
  violations: AplicacaoViolationEntity[];
}>();

const columns: TableColumn<AplicacaoViolationEntity>[] = [
  {
    accessorKey: "estudanteNome",
    header: "Estudante",
  },
  {
    accessorKey: "estudanteEmail",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        label: "Email",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  {
    accessorKey: "tipoInfracao",
    header: "Infração",
    cell: ({ row }) => {
      const infracao = row.getValue("tipoInfracao") as TipoInfracaoEnum;
      const colorMap: Partial<Record<TipoInfracaoEnum, string>> = {
        [TipoInfracaoEnum.TROCA_ABAS]: "warning",
        [TipoInfracaoEnum.COPIAR_COLAR]: "error",
      };
      return h(
        UBadge,
        {
          class: "capitalize",
          variant: "subtle",
          color: colorMap[infracao] || "gray",
        },
        () => infracao
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: "Hora",
    cell: ({ row }) => {
      return new Date(row.getValue("timestamp")).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    },
  },
];

const sorting = ref([
  {
    id: "timestamp",
    desc: true,
  },
]);

const pagination = ref({ pageIndex: 0, pageSize: 10 });
const table = useTemplateRef("table");
</script>
<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Violações Registradas</h3>
    </template>
    <div class="space-y-4">
      <UTable
        ref="table"
        v-model:sorting="sorting"
        v-model:pagination="pagination"
        :data="violations"
        :columns="columns"
        :empty-state="{
          icon: 'i-lucide-shield-off',
          label: 'Nenhuma violação registrada.',
        }"
      />
      <div
        v-if="table && violations.length > pagination.pageSize"
        class="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <UPagination
          :model-value="pagination.pageIndex + 1"
          :page-count="pagination.pageSize"
          :total="violations.length"
          @update:model-value="(p: number) => pagination.pageIndex = p - 1"
        />
      </div>
    </div>
  </UCard>
</template>
