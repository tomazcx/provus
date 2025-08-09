<script setup lang="ts">
import { useExamBankStore } from "~/store/assessmentBankStore";
import isFolder from "~/guards/isFolder";
import type { TExamBankItem } from "~/types/IAvaliacao";

const examBankStore = useExamBankStore();

onMounted(() => {
  examBankStore.fetchItems();
});

const schedules = computed(() => {
  const agora = new Date();
  return examBankStore.items
    .filter(
      (
        item
      ): item is TExamBankItem & { configuracoes: { dataAgendada: Date } } =>
        Boolean(
          !isFolder(item) &&
            item.configuracoes?.dataAgendada &&
            new Date(item.configuracoes.dataAgendada) > agora
        )
    )
    .sort(
      (a, b) =>
        new Date(a.configuracoes.dataAgendada).getTime() -
        new Date(b.configuracoes.dataAgendada).getTime()
    );
});

function formatScheduleTime(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountdown(date: Date | null): string {
  if (!date) return "";
  const agora = new Date();
  const agendamento = new Date(date);
  const diffEmMs = agendamento.getTime() - agora.getTime();
  const diffEmDias = Math.ceil(diffEmMs / (1000 * 60 * 60 * 24));

  if (diffEmDias <= 0) return "Hoje";
  if (diffEmDias === 1) return "Amanhã";
  return `em ${diffEmDias} dias`;
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Próximos Agendamentos</h2>
        <Icon name="i-lucide-calendar-clock" class="text-purple-600" />
      </div>
    </template>

    <div v-if="schedules.length > 0" class="space-y-3">
      <div
        v-for="item in schedules"
        :key="item.id"
        class="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200"
      >
        <div
          class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3"
        >
          <Icon name="i-lucide-clock" class="text-purple-600" />
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ item.titulo }}</h3>
          <p class="text-sm text-gray-600">
            {{ formatScheduleTime(item.configuracoes.dataAgendada) }}
          </p>
        </div>
        <UBadge color="info" variant="soft">{{
          formatCountdown(item.configuracoes.dataAgendada)
        }}</UBadge>
      </div>
    </div>
    <div v-else class="text-center text-sm text-gray-500 py-4">
      Nenhuma avaliação agendada.
    </div>
  </UCard>
</template>
