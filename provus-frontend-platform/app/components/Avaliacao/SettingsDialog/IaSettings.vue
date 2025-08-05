<script setup lang="ts">
import TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const props = defineProps<{
  form: Partial<IAvaliacaoImpl>;
  poolQuestoesCount: number;
}>();

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

const isEmailNotificationSelected = computed({
  get() {
    return (
      formState.value.configuracoes?.tipoNotificacao?.includes(
        TipoNotificacaoEnum.EMAIL
      ) ?? false
    );
  },
  set(value) {
    if (!formState.value.configuracoes) return;

    const selection = new Set(
      formState.value.configuracoes.tipoNotificacao || []
    );

    if (value) {
      selection.add(TipoNotificacaoEnum.EMAIL);
    } else {
      selection.delete(TipoNotificacaoEnum.EMAIL);
    }

    formState.value.configuracoes.tipoNotificacao = Array.from(selection);
  },
});

const isPushNotificationSelected = computed({
  get() {
    return (
      formState.value.configuracoes?.tipoNotificacao?.includes(
        TipoNotificacaoEnum.PUSH_NOTIFICATION
      ) ?? false
    );
  },
  set(value) {
    if (!formState.value.configuracoes) return;

    const selection = new Set(
      formState.value.configuracoes.tipoNotificacao || []
    );

    if (value) {
      selection.add(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    } else {
      selection.delete(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    }

    formState.value.configuracoes.tipoNotificacao = Array.from(selection);
  },
});

const emit = defineEmits(["update:form", "open-bank-dialog", "view-selection"]);
</script>
<template>
  <div v-if="formState.configuracoes" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <div class="flex justify-between">
          <h2 class="font-bold">Geração de Questões</h2>
        </div>
        <p class="text-sm">
          Gere questões
        </p>
      </template>
      <div class="flex flex-col gap-5">
        <UCheckbox
          v-model="isEmailNotificationSelected"
          label="E-mail"
          description="Receba notificações via e-mail."
        />
        <UCheckbox
          v-model="isPushNotificationSelected"
          label="Notificações Push"
          description="Receba notificações pelo aplicativo de celular."
        />
      </div>
    </UCard>
  </div>
</template>
