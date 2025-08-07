<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { IAplicacao, Penalidade } from "~/types/IAplicacao";

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

const props = defineProps<{
  aplicacao: IAplicacao;
}>();

console.log(props.aplicacao.penalidades);

const columns: TableColumn<Penalidade>[] = [
  {
    accessorKey: "estudante",
    header: "Estudante",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "primary",
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
    accessorKey: "infracao",
    header: "Infração",
    cell: ({ row }) => {
      const infracao = row.getValue("infracao") as string;
      const color = "error";
      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => infracao
      );
    },
  },
  {
    accessorKey: "penalidade",
    header: "Penalidade",
    cell: ({ row }) => {
      const penalidade = row.getValue("penalidade") as string;
      return h("span", { class: "text-red-500 font-medium" }, penalidade);
    },
  },
  {
    accessorKey: "hora",
    header: "Hora",
    cell: ({ row }) => {
      return new Date(row.getValue("hora")).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
];

const sorting = ref([
  {
    id: "email",
    desc: false,
  },
]);
</script>

<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        Penalidades e Violações
      </h3>
    </template>
    <UTable
      v-model:sorting="sorting"
      :data="aplicacao.penalidades"
      :columns="columns"
      class="p-3"
    />
  </UCard>
</template>
