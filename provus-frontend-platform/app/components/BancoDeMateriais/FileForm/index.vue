<script setup lang="ts">
import { z } from "zod";
import type { UpdateArquivoRequest } from "~/types/api/request/Arquivo.request";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";

const props = defineProps<{
  initialData?: ArquivoEntity | null;
}>();

const emit = defineEmits<{
  (e: "submit", payload: FormData | UpdateArquivoRequest): void;
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
      form.file = undefined;
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (props.initialData) {
    const updatePayload: UpdateArquivoRequest = {
      titulo: form.titulo,
      descricao: form.descricao,
    };
    emit("submit", updatePayload);
  } 
  else {
    if (!form.file) return;

    const formData = new FormData();
    formData.append("file", form.file);
    
    const finalTitle = form.titulo || form.file.name;
    formData.append("titulo", finalTitle);
    formData.append("descricao", form.descricao || "");

    emit("submit", formData);
  }
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
