<script setup lang="ts">
import Item from "@/components/BancoDeQuestoes/QuestionsBankItem/index.vue";
import type { IFolder } from "~/types/IBank";

defineProps<{
  item: IFolder;
  childCount: number;
}>();
</script>

<template>
  <Item :id="String(item.id)">
    <div
      class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-folder" class="text-yellow-600 text-lg" />
    </div>

    <div>
      <h3 class="font-medium text-gray-900">{{ item.titulo }}</h3>
      <p class="text-sm text-gray-600">
        {{ childCount }} itens • Modificado
        {{ formatDate(item.atualizadoEm) }}
      </p>
    </div>
  </Item>
</template>
