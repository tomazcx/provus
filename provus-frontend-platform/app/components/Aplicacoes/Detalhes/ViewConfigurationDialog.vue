<script setup lang="ts">
import GeneralSettings from "@/components/Avaliacao/SettingsDialog/GeneralSettings.vue";
import SecuritySettings from "@/components/Avaliacao/SettingsDialog/SecuritySettings.vue";
import IaSettings from "@/components/Avaliacao/SettingsDialog/IaSettings.vue";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";

defineProps<{
  modelValue: boolean;
  configuracao: AvaliacaoEntity | null;
}>();

defineEmits(["update:modelValue"]);

const activeSection = ref("geral");

const menuItems = computed(() => [
  {
    key: "geral",
    label: "Geral",
    icon: "i-lucide-file-text",
    active: activeSection.value === "geral",
    click: () => (activeSection.value = "geral"),
  },
  {
    key: "seguranca",
    label: "Segurança",
    icon: "i-lucide-gavel",
    active: activeSection.value === "seguranca",
    click: () => (activeSection.value = "seguranca"),
  },
  {
    key: "ia",
    label: "I.A",
    icon: "i-lucide-brain-circuit",
    active: activeSection.value === "ia",
    click: () => (activeSection.value = "ia"),
  },
]);
</script>

<template>
  <UModal
    title="Configurações da Aplicação"
    description="Visualização das regras e configurações aplicadas a esta avaliação."
    class="min-w-[1080px] min-h-[900px]"
    :open="modelValue"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <div class="flex gap-8 py-4">
        <nav class="w-56 space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.key"
            class="w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors"
            :class="[
              item.active
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-gray-100 text-gray-700',
            ]"
            @click="item.click"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
        <div class="flex-1 border-l border-gray-200 pl-8">
          <fieldset v-if="configuracao" disabled class="contents">
            <div v-if="activeSection === 'geral'">
              <GeneralSettings :form="configuracao" />
            </div>
            <div v-else-if="activeSection === 'seguranca'">
              <SecuritySettings :form="configuracao" />
            </div>
            <div v-else-if="activeSection === 'ia'">
              <IaSettings :form="configuracao" />
            </div>
          </fieldset>
          <div v-else>
            <p class="text-gray-500">Dados da configuração não disponíveis.</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end">
        <UButton
          color="primary"
          variant="solid"
          @click="$emit('update:modelValue', false)"
          >Fechar</UButton
        >
      </div>
    </template>
  </UModal>
</template>
