<script setup lang="ts">
import Details from "@/components/Avaliacao/Details/index.vue";
import AssessmentQuestionList from "@/components/Avaliacao/AssessmentQuestionList/index.vue";
import Overview from "@/components/Avaliacao/Overview/index.vue";
import QuickSettings from "@/components/Avaliacao/QuickSettings/index.vue";
import SettingsDialog from "@/components/Avaliacao/SettingsDialog/index.vue";
import OpenQuestionBankDialog from "@/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import SaveToExamBankDialog from "@/components/BancoDeAvaliacoes/SaveToExamBankDialog/index.vue";
import SaveToQuestionsBankDialog from "@/components/Avaliacao/SaveToQuestionsBankDialog/index.vue";
import GenerateQuestionsIaDialog from "@/components/Avaliacao/GenerateQuestionsIaDialog/index.vue";
import OpenMaterialsBankDialog from "@/components/Avaliacao/OpenMaterialsBankDialog/index.vue";
import ViewAttachedMaterialsDialog from "@/components/Avaliacao/ViewAttachedMaterialsDialog/index.vue";
import StartApplicationDialog from "@/components/Aplicacoes/StartApplicationDialog/index.vue";

import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";

import { useAssessmentStore } from "~/store/assessmentStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import { useEditorBridgeStore } from "~/store/editorBridgeStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

definePageMeta({
  layout: false,
});

const assessmentStore = useAssessmentStore();
const applicationsStore = useApplicationsStore();
const editorBridgeStore = useEditorBridgeStore();
const route = useRoute();
const router = useRouter();

const bancoDeQuestoesDialog = ref(false);
const saveToBankDialog = ref(false);
const questionToSave = ref<QuestaoEntity | null>(null);
const isGenerateAIDialogOpen = ref(false);
const isSaveToExamBankDialogOpen = ref(false);
const applicationToStart = ref<AplicacaoEntity | null>(null);
const isMaterialsBankDialogOpen = ref(false);
const isViewMaterialsDialogOpen = ref(false);
const configuringIaRule = ref<RegraGeracaoIaEntity | null>(null);

const isDialogVisible = computed({
  get: () => !!applicationToStart.value,
  set: (value) => {
    if (!value) {
      applicationToStart.value = null;
    }
  },
});

watch(
  () => editorBridgeStore.saveEvent,
  async (newEvent) => {
    if (newEvent) {
      await handleSave(newEvent);
      editorBridgeStore.clearSaveEvent();
    }
  }
);

onMounted(() => {
  editorBridgeStore.setContext(route.query);
  const assessmentId = route.params.id as string | undefined;

  if (assessmentId) {
    assessmentStore.fetchAssessmentForEdit(parseInt(assessmentId, 10));
  } else {
    const paiIdFromQuery = route.query.paiId ? Number(route.query.paiId) : null;
    assessmentStore.createNew(paiIdFromQuery);
  }
});

async function handleSave(action: { key: string }) {
  if (!assessmentStore.assessmentState) return;

  const isApply = action.key.includes("apply");
  const shouldSaveAsModel = action.key.startsWith("save");

  assessmentStore.assessmentState.isModelo = shouldSaveAsModel;

  const savedAssessment = await assessmentStore.saveOrUpdateAssessment();

  if (savedAssessment) {
    if (isApply) {
      const newApp = await applicationsStore.createApplication(savedAssessment);
      if (newApp) {
        applicationToStart.value = newApp;
      }
    } else {
      router.push("/banco-de-avaliacoes");
    }
  }
}

async function handleStartNowFromEditor() {
  if (applicationToStart.value) {
    const appId = applicationToStart.value.id;
    await applicationsStore.updateApplicationStatus(
      appId,
      EstadoAplicacaoEnum.EM_ANDAMENTO
    );

    applicationToStart.value = null;
    router.push(`/aplicacoes/aplicacao/${appId}/monitoramento`);
  }
}

function handleSettingsUpdate(newSettings: AvaliacaoEntity) {
  assessmentStore.updateSettings(newSettings);
}

function handleSaveQuestionToBank(question: QuestaoEntity) {
  questionToSave.value = JSON.parse(JSON.stringify(question));
  saveToBankDialog.value = true;
}

function handleAIGeneration(regras: RegraGeracaoIaEntity[]) {
  console.log("Regras de Geração por IA recebidas:", regras);
}

function handleOpenMaterialsBankForIa(rule: RegraGeracaoIaEntity) {
  configuringIaRule.value = rule;
  isMaterialsBankDialogOpen.value = true;
}

function handleViewMaterialsForIa(rule: RegraGeracaoIaEntity) {
  console.log("Visualizar materiais para a regra:", rule);
}

function handleMaterialsSelectionForIa(selection: { files: ArquivoEntity[] }) {
  if (configuringIaRule.value && assessmentStore.assessmentState) {
    const selectedFileIds = selection.files.map((f) => f.id);

    selection.files.forEach((file) => {
      const anexoExistente = assessmentStore.assessmentState!.arquivos.some(
        (aw) => aw.arquivo.id === file.id
      );
      if (!anexoExistente) {
        assessmentStore.assessmentState!.arquivos.push({
          arquivo: file,
          permitirConsultaPorEstudante: true,
        });
      }
    });

    configuringIaRule.value.materiaisAnexadosIds = selectedFileIds;
    configuringIaRule.value = null;
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <main class="flex-1">
      <div
        v-if="assessmentStore.isLoading"
        class="flex items-center justify-center h-full"
      >
        <p>Carregando Editor...</p>
      </div>
      <div v-else-if="assessmentStore.assessmentState" class="h-full">
        <StartApplicationDialog
          v-model="isDialogVisible"
          :aplicacao="applicationToStart"
          @start-now="handleStartNowFromEditor"
        />
        <SaveToExamBankDialog
          v-model="isSaveToExamBankDialogOpen"
          @save-here="() => {}"
        />
        <SettingsDialog
          v-model="assessmentStore.isSettingsDialogOpen"
          :initial-data="assessmentStore.assessment"
          @save="handleSettingsUpdate"
        />
        <OpenQuestionBankDialog
          v-model="bancoDeQuestoesDialog"
          @add-questions="
            assessmentStore.addQuestionsFromBank($event.questions)
          "
        />
        <SaveToQuestionsBankDialog
          v-model="saveToBankDialog"
          :question-to-save="questionToSave"
        />
        <GenerateQuestionsIaDialog
          v-model="isGenerateAIDialogOpen"
          :materiais-anexados="
            assessmentStore.assessmentState.arquivos.map((a) => a.arquivo)
          "
          @generate="handleAIGeneration"
          @open-materials-bank="handleOpenMaterialsBankForIa"
          @view-materials="handleViewMaterialsForIa"
        />
        <OpenMaterialsBankDialog
          v-model="isMaterialsBankDialogOpen"
          @add-materials="handleMaterialsSelectionForIa"
        />
        <ViewAttachedMaterialsDialog
          v-model="isViewMaterialsDialogOpen"
          :selected-materials="
            assessmentStore.assessmentState.arquivos.map((a) => a.arquivo)
          "
        />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-3 space-y-6">
              <Details v-model="assessmentStore.assessmentState" />

              <AssessmentQuestionList
                v-if="assessmentStore.assessmentState.questoes"
                v-model:questoes="assessmentStore.assessmentState.questoes"
                :autocorrecao-ativa="
                  assessmentStore.assessmentState.configuracao
                    .configuracoesSeguranca.ativarCorrecaoDiscursivaViaIa
                "
                @adicionar="assessmentStore.addQuestion"
                @remover="assessmentStore.removeQuestion"
                @adicionar-do-banco="bancoDeQuestoesDialog = true"
                @save-to-bank="handleSaveQuestionToBank"
                @gerar-ia="isGenerateAIDialogOpen = true"
              />
            </div>
            <div class="sticky top-24 space-y-6 self-start">
              <Overview :prova="assessmentStore.assessment" />
              <QuickSettings v-model="assessmentStore.assessmentState" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
