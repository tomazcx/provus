<script setup lang="ts">
import type { ArquivoSubmissaoResponse } from "~/types/api/response/Submissao.response";
import VuePdfEmbed from "vue-pdf-embed";

const props = defineProps<{
  modelValue: boolean;
  arquivos: ArquivoSubmissaoResponse[] | null;
}>();

const emit = defineEmits(["update:modelValue"]);
const selectedFile = ref<ArquivoSubmissaoResponse | null>(null);
const isLoadingPdf = ref(true);
const hasRenderError = ref(false);

const pdfScale = ref(1.0);

function zoomIn() {
  if (pdfScale.value < 3.0) {
    pdfScale.value += 0.25;
  }
}

function zoomOut() {
  if (pdfScale.value > 0.5) {
    pdfScale.value -= 0.25;
  }
}

function resetZoom() {
  pdfScale.value = 1.0;
}

function getFileType(url: string | undefined): "pdf" | "image" {
  if (!url) return "pdf";

  try {
    const cleanUrl = url.split("?")[0];
    const extension = cleanUrl.split(".").pop()?.toLowerCase() || "";

    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];

    if (imageExtensions.includes(extension)) {
      return "image";
    }
    return "pdf";
  } catch (e) {
    console.warn("Erro ao detectar tipo de arquivo, assumindo PDF:", e);
    return "pdf";
  }
}

function handleOpenFile(file: ArquivoSubmissaoResponse) {
  selectedFile.value = file;
  isLoadingPdf.value = true;
  hasRenderError.value = false;
  pdfScale.value = 1.0; 
}

function closePreview() {
  selectedFile.value = null;
  hasRenderError.value = false;
}

function onPdfLoaded() {
  isLoadingPdf.value = false;
}

function onPdfError() {
  isLoadingPdf.value = false;
  hasRenderError.value = true;
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      selectedFile.value = null;
      hasRenderError.value = false;
      pdfScale.value = 1.0;
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
        <h2 class="text-xl font-bold text-gray-900 truncate pr-4">
          {{ selectedFile ? selectedFile.titulo : "Materiais de Consulta" }}
        </h2>

        <div class="flex items-center gap-2">
          <UButton
            v-if="selectedFile"
            color="gray"
            variant="ghost"
            icon="i-lucide-arrow-left"
            @click="closePreview"
          >
            Voltar
          </UButton>
        </div>
      </div>
    </template>

    <template #body>
      <div
        v-if="selectedFile"
        class="h-[75vh] w-full bg-gray-100 rounded-lg relative overflow-hidden flex flex-col"
      >
        <div
          v-if="
            getFileType(selectedFile.url) === 'pdf' &&
            !hasRenderError &&
            !isLoadingPdf
          "
          class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 border border-gray-200"
        >
          <UTooltip text="Diminuir Zoom">
            <UButton
              icon="i-lucide-minus"
              color="primary"
              variant="ghost"
              size="sm"
              class="rounded-full"
              :disabled="pdfScale <= 0.5"
              @click="zoomOut"
            />
          </UTooltip>

          <span
            class="text-sm font-medium text-gray-700 min-w-[3rem] text-center select-none"
          >
            {{ Math.round(pdfScale * 100) }}%
          </span>

          <UTooltip text="Aumentar Zoom">
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="ghost"
              size="sm"
              class="rounded-full"
              :disabled="pdfScale >= 3.0"
              @click="zoomIn"
            />
          </UTooltip>

          <div class="w-px h-4 bg-gray-300 mx-1" />

          <UTooltip text="Resetar">
            <UButton
              icon="i-lucide-maximize"
              color="primary"
              variant="ghost"
              size="sm"
              class="rounded-full"
              @click="resetZoom"
            />
          </UTooltip>
        </div>

        <div
          v-if="hasRenderError"
          class="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center"
        >
          <Icon
            name="i-lucide-file-warning"
            class="text-5xl mb-4 text-orange-400"
          />
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            Visualização indisponível
          </h3>
          <p class="mb-6 max-w-md">
            O formato deste arquivo não pôde ser renderizado com segurança.
          </p>

          <div class="bg-red-50 border border-red-100 rounded-lg p-4 max-w-md">
            <p
              class="text-sm text-red-600 font-bold flex items-center gap-2 mb-2"
            >
              <Icon name="i-lucide-alert-triangle" />
              ATENÇÃO
            </p>
            <p class="text-sm text-red-600 mb-3">
              Fazer o download ou abrir este arquivo externamente pode ser
              detectado como <strong>"Troca de Aba"</strong> pelo sistema de
              segurança.
            </p>
            <UButton
              :to="selectedFile.url"
              target="_blank"
              color="error"
              variant="soft"
              size="sm"
              icon="i-lucide-external-link"
              block
            >
              Arriscar e Abrir Externamente
            </UButton>
          </div>
        </div>

        <div
          v-else-if="getFileType(selectedFile.url) === 'pdf'"
          class="w-full h-full overflow-auto flex justify-center bg-gray-200/50 p-4"
        >
          <div
            v-if="isLoadingPdf"
            class="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80"
          >
            <Icon
              name="i-lucide-loader-2"
              class="animate-spin h-10 w-10 text-primary"
            />
          </div>

          <div
            :style="{
              width: `${pdfScale * 100}%`,
              transition: 'width 0.2s ease-out',
            }"
            class="origin-top"
          >
            <VuePdfEmbed
              :source="selectedFile.url"
              class="shadow-lg bg-white rounded-sm"
              @loaded="onPdfLoaded"
              @loading-failed="onPdfError"
            />
          </div>
        </div>

        <div
          v-else-if="getFileType(selectedFile.url) === 'image'"
          class="w-full h-full flex items-center justify-center overflow-auto bg-black/5"
        >
          <img
            :src="selectedFile.url"
            :alt="selectedFile.titulo"
            class="max-w-full max-h-full object-contain rounded shadow-sm transition-transform duration-200"
            :style="{ transform: `scale(${pdfScale})` }"
            @error="onPdfError"
          >

          <div
            v-if="!hasRenderError"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 border border-gray-200"
          >
            <UTooltip text="Diminuir Zoom">
              <UButton
                icon="i-lucide-minus"
                color="gray"
                variant="ghost"
                size="sm"
                class="rounded-full"
                :disabled="pdfScale <= 0.5"
                @click="zoomOut"
              />
            </UTooltip>

            <span
              class="text-sm font-medium text-gray-700 min-w-[3rem] text-center select-none"
            >
              {{ Math.round(pdfScale * 100) }}%
            </span>

            <UTooltip text="Aumentar Zoom">
              <UButton
                icon="i-lucide-plus"
                color="gray"
                variant="ghost"
                size="sm"
                class="rounded-full"
                :disabled="pdfScale >= 3.0"
                @click="zoomIn"
              />
            </UTooltip>

            <div class="w-px h-4 bg-gray-300 mx-1" />

            <UTooltip text="Resetar">
              <UButton
                icon="i-lucide-maximize"
                color="gray"
                variant="ghost"
                size="sm"
                class="rounded-full"
                @click="resetZoom"
              />
            </UTooltip>
          </div>
        </div>
      </div>

      <div v-else class="max-h-[60vh] overflow-y-auto">
        <div
          v-if="!arquivos || arquivos.length === 0"
          class="flex flex-col items-center justify-center py-12 text-gray-400"
        >
          <Icon name="i-lucide-folder-open" class="text-4xl mb-3 opacity-50" />
          <p>Nenhum material de consulta disponível.</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-3">
          <div
            v-for="file in arquivos"
            :key="file.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-primary-200 cursor-pointer transition-all flex items-center justify-between group"
            @click="handleOpenFile(file)"
          >
            <div class="flex items-center space-x-4 overflow-hidden">
              <div
                class="p-3 rounded-lg shrink-0"
                :class="
                  getFileType(file.url) === 'pdf'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                "
              >
                <Icon
                  :name="
                    getFileType(file.url) === 'pdf'
                      ? 'i-lucide-file-text'
                      : 'i-lucide-image'
                  "
                  class="text-xl"
                />
              </div>
              <div class="min-w-0">
                <span class="font-medium text-gray-800 block truncate">{{
                  file.titulo
                }}</span>
                <span class="text-xs text-gray-500 truncate block">
                  {{ file.descricao || "Sem descrição adicional" }}
                </span>
              </div>
            </div>

            <div
              class="flex items-center text-gray-400 group-hover:text-primary transition-colors"
            >
              <span class="text-sm mr-2 font-medium">Ler</span>
              <Icon name="i-lucide-chevron-right" />
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
