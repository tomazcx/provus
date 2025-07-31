<script setup lang="ts">
import Details from "@/components/Avaliacao/Details/index.vue";
import SaveToQuestionsBankDialog from "@/components/Avaliacao/SaveToQuestionsBankDialog/index.vue";
import AssessmentQuestionList from "@/components/Avaliacao/AssessmentQuestionList/index.vue";
import Overview from "@/components/Avaliacao/Overview/index.vue";
import QuickSettings from "@/components/Avaliacao/QuickSettings/index.vue";
import SettingsDialog from "@/components/Avaliacao/SettingsDialog/index.vue";
import type { IQuestao } from "~/types/IQuestao";
import { useAssessmentSettingsStore } from "~/store/assessmentSettingsStore";
import { useAssessmentStore } from "~/store/assessmentStore";
import type { AvaliacaoImpl } from "~/types/IAvaliacao";

const settingsStore = useAssessmentSettingsStore();
const assessmentStore = useAssessmentStore();

onMounted(() => {
  assessmentStore.createNew();
});

const bancoDeQuestoesDialog = ref(false);
const saveToBankDialog = ref(false);
const questionToSave = ref<IQuestao | null>(null);
function adicionarQuestao() {
  assessmentStore.addQuestion();
}

function removerQuestao(id: number) {
  assessmentStore.removeQuestion(id);
}

function handleAddQuestionsFromBank(selection: {
  questions: IQuestao[];
  rawSelection: { folders: number[]; questions: number[] };
}) {
  assessmentStore.addQuestionsFromBank(selection.questions);
}

function handleSaveQuestionToBank(question: IQuestao) {
  questionToSave.value = JSON.parse(JSON.stringify(question));
  saveToBankDialog.value = true;
}

function handleSettingsUpdate(newSettings: Partial<AvaliacaoImpl>) {
  assessmentStore.updateSettings(newSettings);
}
</script>

<template>
  <div v-if="assessmentStore.assessment" class="bg-gray-50 min-h-screen">
    <SettingsDialog
      v-model="settingsStore.isSettingsDialogOpen"
      :initial-data="assessmentStore.assessment"
      @save="handleSettingsUpdate"
    />

    <OpenQuestionBankDialog
      v-model="bancoDeQuestoesDialog"
      @add-questions="handleAddQuestionsFromBank"
    />

    <SaveToQuestionsBankDialog
      v-model="saveToBankDialog"
      :question-to-save="questionToSave"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-6">
          <Details v-model="assessmentStore.assessment" />
          <AssessmentQuestionList
            v-model:questoes="assessmentStore.assessment.questoes"
            @adicionar="adicionarQuestao"
            @remover="removerQuestao"
            @adicionar-do-banco="bancoDeQuestoesDialog = true"
            @save-to-bank="handleSaveQuestionToBank"
          />
        </div>
        <div class="sticky top-24 space-y-6">
          <Overview :prova="assessmentStore.assessment" />
          <QuickSettings v-model="assessmentStore.assessment.configuracoes" />
        </div>
      </div>
    </div>
  </div>
</template>
