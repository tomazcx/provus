<script setup lang="ts">
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const props = defineProps<{
  form: Partial<IAvaliacaoImpl>;
}>();

const emit = defineEmits([
  "update:form",
  "open-materials-bank-for-rule",
  "view-material-for-rule",
]);

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

</script>

<template>
  <div v-if="formState.configuracoes" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Correção Automática</h2>
      </template>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="formState.configuracoes.autocorrecaoIa"
          label="Ativar autocorreção para questões discursivas"
          description="A I.A. irá analisar as respostas textuais dos alunos e atribuir uma pontuação."
        />
      </div>
    </UCard>

  </div>
</template>
