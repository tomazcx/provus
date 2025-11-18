<script setup lang="ts">
import type { ArquivoSubmissaoResponse } from "~/types/api/response/Submissao.response";

const props = defineProps<{
  modelValue: boolean;
  arquivos: ArquivoSubmissaoResponse[] | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const selectedFile = ref<ArquivoSubmissaoResponse | null>(null);

function getFileType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif"].includes(extension || "")) return "image";
  return "other";
}

function handleOpenFile(file: ArquivoSubmissaoResponse) {
  selectedFile.value = file;
}

function closePreview() {
  selectedFile.value = null;
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      selectedFile.value = null;
    }
  }
);
</script>

<template>
  <UModal
    :open="modelValue"
    :class="selectedFile ? 'w-full sm:max-w-6xl' : 'w-full sm:max-w-4xl'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">
          {{ selectedFile ? selectedFile.titulo : "Materiais de Consulta" }}
        </h2>
        <UButton
          v-if="selectedFile"
          color="gray"
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="closePreview"
        >
          Voltar para lista
        </UButton>
      </div>
    </template>

    <template #body>
      <div
        v-if="selectedFile"
        class="h-[70vh] w-full bg-gray-100 rounded-lg overflow-hidden relative"
      >
        <div
          v-if="getFileType(selectedFile.url) === 'pdf'"
          class="w-full h-full"
        >
          <iframe
            :src="selectedFile.url"
            class="w-full h-full border-0"
            title="Visualizador de PDF"
          ></iframe>
        </div>

        <div
          v-else-if="getFileType(selectedFile.url) === 'image'"
          class="w-full h-full flex items-center justify-center overflow-auto"
        >
          <img
            :src="selectedFile.url"
            :alt="selectedFile.titulo"
            class="max-w-full max-h-full object-contain"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center"
        >
          <Icon name="i-lucide-file-warning" class="text-4xl mb-4" />
          <p class="mb-4">
            Este tipo de arquivo não pode ser visualizado diretamente na
            plataforma sem sair da aba.
          </p>
          <p class="text-sm text-red-500 font-bold mb-4">
            ATENÇÃO: Fazer o download ou abrir externamente pode acionar o
            detector de troca de abas.
          </p>
          <UButton
            :to="selectedFile.url"
            target="_blank"
            color="primary"
            variant="outline"
            icon="i-lucide-external-link"
          >
            Abrir mesmo assim (Risco de Bloqueio)
          </UButton>
        </div>
      </div>

      <div v-else class="max-h-[60vh] overflow-y-auto">
        <div
          v-if="!arquivos || arquivos.length === 0"
          class="text-center text-gray-500 py-8"
        >
          Nenhum material de consulta disponível para esta avaliação.
        </div>

        <div v-else class="grid grid-cols-1 gap-3">
          <div
            v-for="file in arquivos"
            :key="file.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
            @click="handleOpenFile(file)"
          >
            <div class="flex items-center space-x-3">
              <div class="bg-primary-50 p-2 rounded-lg text-primary">
                <Icon name="i-lucide-file-text" class="text-xl" />
              </div>
              <div>
                <span class="font-medium text-gray-800 block">{{
                  file.titulo
                }}</span>
                <span
                  class="text-xs text-gray-500 truncate max-w-[300px] block"
                  >{{ file.descricao || "Sem descrição" }}</span
                >
              </div>
            </div>

            <div
              class="flex items-center text-gray-400 group-hover:text-primary transition-colors"
            >
              <span class="text-sm mr-2">Visualizar</span>
              <Icon name="i-lucide-eye" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton
          color="primary"
          variant="ghost"
          @click="emit('update:modelValue', false)"
        >
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
