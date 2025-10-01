<script setup lang="ts">
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";

const props = defineProps<{
  form: AvaliacaoEntity;
}>();

const emit = defineEmits(["update:form"]);

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});
</script>

<template>
  <div v-if="formState.configuracao" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Correção Automática</h2>
      </template>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="
            formState.configuracao.configuracoesSeguranca
              .ativarCorrecaoDiscursivaViaIa
          "
          label="Ativar autocorreção para questões discursivas"
          description="A I.A. irá analisar as respostas textuais dos alunos e atribuir uma pontuação."
        />
      </div>
    </UCard>
  </div>
</template>
