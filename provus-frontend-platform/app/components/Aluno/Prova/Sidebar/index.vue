<script setup lang="ts">
import type {
  QuestaoSubmissaoResponse,
  ArquivoSubmissaoResponse,
} from "~/types/api/response/Submissao.response";
import { useStudentAssessmentStore } from "~/store/studentAssessmentStore";

const props = defineProps<{
  questoes: QuestaoSubmissaoResponse[] | null;
  arquivos: ArquivoSubmissaoResponse[] | null;
  pontuacaoTotal: number;
  answeredQuestions: Set<number>;
  tempoMaximo?: number | null;
  descricaoAvaliacao?: string | null;
}>();

const emit = defineEmits(["goToQuestion", "openMaterials", "toggleView"]);
const studentAssessmentStore = useStudentAssessmentStore();
const pontosPerdidos = computed(() => studentAssessmentStore.pontosPerdidos);

const totalQuestoes = computed(() => props.questoes?.length ?? 0);
const permitirConsulta = computed(() => (props.arquivos?.length ?? 0) > 0);
</script>

<template>
  <div
    class="fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto"
  >
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-lg font-bold text-primary mb-4">Informações</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Duração:</span>
            <span class="font-medium">{{
              tempoMaximo != null ? `${tempoMaximo} minutos` : "-- min"
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total de Pontos:</span>
            <span class="font-medium">{{ pontuacaoTotal }} pontos</span>
          </div>
          <div
            v-if="pontosPerdidos > 0"
            class="flex justify-between text-error-600"
          >
            <span class="font-bold">-{{ pontosPerdidos }} ponto(s)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Questões:</span>
            <span class="font-medium">{{ totalQuestoes }} questões</span>
          </div>
        </div>
        <UAlert
          v-if="descricaoAvaliacao"
          :description="descricaoAvaliacao"
          class="mt-4"
          variant="subtle"
          dense
        />
      </div>

      <div class="mb-6">
        <h3 class="text-md font-semibold text-gray-900 mb-3">Questões</h3>
        <div class="grid grid-cols-5 gap-2">
          <UButton
            v-for="(questao, index) in questoes"
            :key="questao.id"
            :label="String(index + 1)"
            :variant="answeredQuestions.has(questao.id!) ? 'solid' : 'outline'"
            :color="answeredQuestions.has(questao.id!) ? 'secondary' : 'primary'"
            class="aspect-square flex items-center justify-center"
            @click="emit('goToQuestion', index)"
          />
        </div>

        <div class="mt-3 text-xs text-gray-500">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-1.5">
              <div class="w-3 h-3 bg-secondary rounded" />
              <span>Respondida</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-3 h-3 ring-1 ring-inset ring-primary rounded" />
              <span>Não Respondida</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <UButton
          block
          color="primary"
          variant="outline"
          icon="i-lucide-file"
          label="Visão Paginada"
          @click="emit('toggleView')"
        />
        <UButton
          v-if="permitirConsulta"
          block
          color="primary"
          icon="i-lucide-book-open"
          label="Ver Materiais"
          @click="emit('openMaterials')"
        />
      </div>
    </div>
  </div>
</template>
