<script setup lang="ts">
import Item from "@/components/ui/BankItem/index.vue";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import formatDate from "~/utils/formatDate";

const props = defineProps<{
  item: ArquivoEntity;
  isSelected?: boolean;
  selectable?: boolean;
  permitirConsulta?: boolean;
}>();

const emit = defineEmits([
  "edit",
  "delete",
  "select",
  "update:permitirConsulta",
]);

const consultaModel = computed({
  get: () => props.permitirConsulta,
  set: (value) => emit("update:permitirConsulta", value),
});
</script>

<template>
  <Item
    :id="String(item.id)"
    :class="{ '!bg-primary/10': isSelected }"
    @edit="emit('edit')"
    @delete="emit('delete')"
  >
    <div v-if="selectable" class="flex items-center pr-2" @click.stop>
      <UCheckbox
        :model-value="isSelected"
        @update:model-value="emit('select', item)"
      />
    </div>
    <div
      class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-file-text" class="text-green-600 text-lg" />
    </div>
    <div>
      <h3 class="font-medium text-gray-900">{{ item.titulo }}</h3>
      <p class="text-sm text-gray-600">
        Modificado em {{ formatDate(item.atualizadoEm) }}
      </p>
    </div>

    <div class="ml-auto flex items-center space-x-2 pl-4" @click.stop>
      <div class="flex flex-col items-end">
        <span class="text-xs text-gray-500">Consulta do Aluno</span>
        <USwitch v-model="consultaModel" />
      </div>
    </div>
  </Item>
</template>
