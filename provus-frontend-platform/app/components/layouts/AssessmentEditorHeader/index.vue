<script setup lang="ts">
import { useAssessmentStore } from "~/store/assessmentStore";
import { useEditorBridgeStore } from "~/store/editorBridgeStore";

const assessmentStore = useAssessmentStore();
const editorBridgeStore = useEditorBridgeStore();

const saveContext = computed(() => editorBridgeStore.context);

function handleSaveAction(option: { key: string }) {
  editorBridgeStore.triggerSave(option);
}

const saveOptions = computed(() => {
  const options = [];
  options.push([
    {
      label: "Salvar Modelo no Banco",
      key: "save_template",
      icon: "i-lucide-save",
    },
  ]);
  options.push([
    {
      label: "Salvar Modelo e Aplicar",
      key: "save_and_apply",
      icon: "i-lucide-send",
    },
    {
      label: "Apenas Aplicar (sem salvar)",
      key: "apply_only",
      icon: "i-lucide-send-to-back",
    },
  ]);
  return options;
});
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <UButton
            :to="saveContext.from === 'bank' ? '/banco-de-avaliacoes' : '/home'"
            color="primary"
            variant="ghost"
            icon="i-lucide-arrow-left"
            size="xl"
          />
          <span class="ml-3 text-xl font-bold text-primary">
            Editor de Avaliações
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-cog-6-tooth"
            @click="assessmentStore.openSettingsDialog()"
          >
            Configurações
          </UButton>

          <UDropdownMenu
            :items="saveOptions"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton
              color="secondary"
              icon="i-heroicons-arrow-down-tray"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            >
              Salvar e Aplicar
            </UButton>
            <template #item="{ item }">
              <span @click="handleSaveAction(item)">{{ item.label }}</span>
            </template>
          </UDropdownMenu>
        </div>
      </div>
    </div>
  </header>
</template>
