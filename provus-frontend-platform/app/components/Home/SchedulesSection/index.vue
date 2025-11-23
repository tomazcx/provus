<script setup lang="ts">
import { useApplicationsStore } from "~/store/applicationsStore";
import { formatTimeDistance } from "~/utils/formatTimeDistance";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const applicationsStore = useApplicationsStore();
const schedules = computed(() => applicationsStore.upcomingSchedules);

function formatScheduleTime(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        v-for="app in schedules"
        :key="app.id"
        class="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200"
      >
        <div
          class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 shrink-0"
        >
          <Icon name="i-lucide-clock" class="text-purple-600" />
        </div>
        <div class="flex-1 min-w-0">
          <div
            class="font-medium text-gray-900 max-h-[1.5rem] overflow-hidden relative"
          >
            <RichTextEditor
              :model-value="app.avaliacao.titulo"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none"
            />
          </div>
          <p class="text-sm text-gray-600">
            {{ formatScheduleTime(app.dataInicio) }}
          </p>
        </div>
        <UBadge color="info" variant="soft" class="shrink-0 ml-2">
          {{ formatTimeDistance(app.dataInicio.toISOString()) }}
        </UBadge>
      </div>
    </div>
    <div v-else class="text-center text-sm text-gray-500 py-4">
      Nenhuma avaliação agendada.
    </div>
  </UCard>
</template>

<style scoped>
/* Remove margens padrão do editor */
:deep(.prose p) {
  margin: 0;
}
</style>
