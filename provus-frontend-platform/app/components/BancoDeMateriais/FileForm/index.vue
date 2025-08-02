<script setup lang="ts">
import { z } from "zod"; 
import type { IFile } from "~/types/IFile";
import TipoArquivoEnum from "~/enums/TipoArquivoEnum";

const props = defineProps<{
  initialData?: IFile | null;
}>();

const emit = defineEmits<{
  (
    e: "submit",
    payload: Omit<IFile, "id" | "path" | "criadoEm" | "atualizadoEm">
  ): void;
}>();

const schema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  file: z.instanceof(File, { message: "É necessário selecionar um arquivo." }),
});

const editSchema = schema.extend({
  file: z.instanceof(File).optional(),
});

const form = reactive({
  titulo: "",
  descricao: "",
  file: undefined as File | undefined,
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.titulo = data.titulo;
      form.descricao = data.descricao || "";
    }
  },
  { immediate: true }
);

function getFileType(fileName: string): TipoArquivoEnum {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return TipoArquivoEnum.PDF;
  if (extension === "docx" || extension === "doc") return TipoArquivoEnum.DOCX;
  if (extension === "pptx" || extension === "ppt") return TipoArquivoEnum.PPTX;
  if (extension === "txt") return TipoArquivoEnum.TXT;
  return TipoArquivoEnum.OUTRO;
}

function handleSubmit() {
  const finalTitle =
    form.titulo ||
    (form.file ? form.file.name : props.initialData?.titulo) ||
    "";

  const finalPayload = {
    titulo: finalTitle,
    descricao: form.descricao,
    url: props.initialData?.url || `/${form.file?.name}`,
    tipo: props.initialData?.tipo || getFileType(form.file!.name),
    tamanhoEmBytes: props.initialData?.tamanhoEmBytes || form.file!.size,
  };

  emit("submit", finalPayload);
}
</script>

<template>
  <UForm
    id="file-form"
    :schema="initialData ? editSchema : schema"
    :state="form"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-6">
      <UFormField v-if="!initialData" label="Arquivo" name="file" required>
        <UFileUpload
          v-model="form.file"
          :max-size="5 * 1024 * 1024"
          icon="i-lucide-upload-cloud"
          color="neutral"
          highlight
          title="Clique ou arraste um arquivo"
          description="Tamanho máximo: 5MB"
        />
      </UFormField>

      <UFormField v-else label="Arquivo">
        <div class="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
          <Icon name="i-lucide-file-check-2" class="h-8 w-8 text-gray-500" />
          <div class="flex-1">
            <p class="font-medium text-sm truncate">
              {{ initialData?.titulo }}
            </p>
            <p class="text-xs text-gray-500">
              {{ initialData?.tipo }}
            </p>
          </div>
        </div>
      </UFormField>

      <UFormField label="Título do Material" name="titulo">
        <UInput
          v-model="form.titulo"
          :placeholder="
            form.file ? form.file.name : 'Ex: Resumo sobre Iluminismo'
          "
          class="w-full"
        />
      </UFormField>

      <UFormField label="Descrição (Opcional)" name="descricao">
        <UTextarea
          v-model="form.descricao"
          placeholder="Digite uma breve descrição do conteúdo do material..."
          class="w-full"
        />
      </UFormField>
    </div>
  </UForm>
</template>