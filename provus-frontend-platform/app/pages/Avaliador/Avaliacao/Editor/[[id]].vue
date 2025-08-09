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

import type { IQuestao } from "~/types/IQuestao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type { IRegraGeracaoIA } from "~/types/IConfiguracoesAvaliacoes";
import type { IFile } from "~/types/IFile";

import { useAssessmentStore } from "~/store/assessmentStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import { useEditorBridgeStore } from "~/store/editorBridgeStore";
import { useApplicationsStore } from "~/store/applicationsStore";

const assessmentStore = useAssessmentStore();
const examBankStore = useExamBankStore();
const editorBridgeStore = useEditorBridgeStore();
const applicationsStore = useApplicationsStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isSaveToBankDialogOpen = ref(false);
const bancoDeQuestoesDialog = ref(false);
const saveToBankDialog = ref(false);
const questionToSave = ref<IQuestao | null>(null);
const isGenerateAIDialogOpen = ref(false);
const isMaterialsBankDialogOpen = ref(false);
const isViewMaterialsDialogOpen = ref(false);
const materialsToView = ref<IFile[]>([]);
const configuringIaRule = ref<IRegraGeracaoIA | null>(null);
const pendingAction = ref<"apply" | null>(null);

watch(
  () => editorBridgeStore.saveEvent,
  (newEvent) => {
    if (newEvent) {
      handleSave(newEvent);
      editorBridgeStore.clearSaveEvent();
    }
  }
);

onMounted(() => {
  editorBridgeStore.setContext(route.query);

  const assessmentId = route.params.id as string | undefined;

  if (assessmentId) {
    const idAsNumber = parseInt(assessmentId, 10);
    const modelo = examBankStore.getItemById(idAsNumber);

    if (modelo) {
      assessmentStore.loadFromModelo(modelo);
    } else {
      console.error("Modelo de avaliação não encontrado!");
      assessmentStore.createNew();
    }
  } else {
    assessmentStore.createNew();
  }
});

const applyAssessment = (modelo: IAvaliacaoImpl) => {
  applicationsStore.createApplication(modelo);
  toast.add({
    title: "Avaliação aplicada com sucesso!",
    description: "Os alunos já podem começar.",
    icon: "i-lucide-send",
  });
  router.push("/aplicacoes");
};

const saveOrUpdateModelo = async (
  isModelo: boolean,
  pathOverride?: string
): Promise<IAvaliacaoImpl> => {
  const assessmentData = assessmentStore.assessment;
  if (!assessmentData) throw new Error("Dados da avaliação não encontrados.");

  assessmentData.isModelo = isModelo;

  if (assessmentData.id) {
    const updatedModelo = await examBankStore.updateItem({
      item: assessmentData,
      updatedData: assessmentData,
    });
    toast.add({
      title: "Modelo atualizado com sucesso!",
      icon: "i-lucide-check-circle",
    });
    return updatedModelo as IAvaliacaoImpl;
  } else {
    const path =
      pathOverride ??
      (editorBridgeStore.context.from === "bank"
        ? editorBridgeStore.context.path ?? "/"
        : "/");
    const newModelo = await examBankStore.createModelo({
      modeloData: assessmentData,
      path: path,
    });

    return newModelo;
  }
};

async function handleSave(action: { key: string }) {
  const assessmentData = assessmentStore.assessment;
  if (!assessmentData) return;

  const isNewAssessmentFromDashboard =
    !assessmentData.id && editorBridgeStore.context.from === "dashboard";

  if (action.key === "save_template") {
    if (isNewAssessmentFromDashboard) {
      isSaveToBankDialogOpen.value = true;
    } else {
      await saveOrUpdateModelo(true);
      router.push("/banco-de-avaliacoes");
    }
  } else if (action.key === "save_and_apply") {
    if (isNewAssessmentFromDashboard) {
      pendingAction.value = "apply";
      isSaveToBankDialogOpen.value = true;
    } else {
      const modeloSalvo = await saveOrUpdateModelo(true);
      applyAssessment(modeloSalvo);
    }
  } else if (action.key === "apply_only") {
    const modeloSalvo = await saveOrUpdateModelo(false);
    applyAssessment(modeloSalvo);
  }
}

async function handleSaveFromDialog(savePath: string) {
  const newModelo = await saveOrUpdateModelo(true, savePath);

  isSaveToBankDialogOpen.value = false;
  toast.add({
    title: "Modelo salvo com sucesso!",
    icon: "i-lucide-check-circle",
  });

  if (pendingAction.value === "apply") {
    applyAssessment(newModelo);
  } else {
    router.push("/banco-de-avaliacoes");
  }

  pendingAction.value = null;
}

function adicionarQuestao() {
  assessmentStore.addQuestion();
}

function removerQuestao(id: number) {
  assessmentStore.removeQuestion(id);
}

function handleAddQuestionsFromBank(selection: { questions: IQuestao[] }) {
  assessmentStore.addQuestionsFromBank(selection.questions);
}

function handleSettingsUpdate(newSettings: Partial<IAvaliacaoImpl>) {
  assessmentStore.updateSettings(newSettings);
}

function handleAIGeneration(regras: IRegraGeracaoIA[]) {
  assessmentStore.generateAndAddQuestions(regras);
}

function handleSaveQuestionToBank(question: IQuestao) {
  questionToSave.value = JSON.parse(JSON.stringify(question));
  saveToBankDialog.value = true;
}

function handleOpenMaterialsBankForIa(rule: IRegraGeracaoIA) {
  configuringIaRule.value = rule;
  isMaterialsBankDialogOpen.value = true;
}

function handleViewMaterialsForIa(rule: IRegraGeracaoIA) {
  if (
    assessmentStore.assessment &&
    rule.materiaisAnexadosIds.length > 0 &&
    assessmentStore.assessment.configuracoes.materiaisAnexados &&
    assessmentStore.assessment.configuracoes.materiaisAnexados.arquivos
  ) {
    const materiais =
      assessmentStore.assessment.configuracoes.materiaisAnexados.arquivos.filter(
        (m) => rule.materiaisAnexadosIds.includes(m.id!)
      );
    materialsToView.value = materiais;
    isViewMaterialsDialogOpen.value = true;
  }
}

function handleMaterialsSelectionForIa(selection: { files: IFile[] }) {
  if (configuringIaRule.value && assessmentStore.assessment) {
    const selectedFileIds = selection.files.map((f) => f.id!);
    selection.files.forEach((file) => {
      const materiaisAnexados =
        assessmentStore.assessment!.configuracoes.materiaisAnexados;
      if (materiaisAnexados && materiaisAnexados.arquivos) {
        const anexoExistente = materiaisAnexados.arquivos.find(
          (f) => f.id === file.id
        );
        if (!anexoExistente) {
          materiaisAnexados.arquivos.push(file);
        }
      }
    });
    configuringIaRule.value.materiaisAnexadosIds = selectedFileIds;
    configuringIaRule.value = null;
  }
}
</script>

<template>
  <div v-if="assessmentStore.assessmentState" class="bg-gray-50 min-h-screen">
    <SaveToExamBankDialog
      v-model="isSaveToBankDialogOpen"
      @save-here="handleSaveFromDialog"
    />
    <SettingsDialog
      v-model="assessmentStore.isSettingsDialogOpen"
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
    <GenerateQuestionsIaDialog
      v-model="isGenerateAIDialogOpen"
      :materiais-anexados="
        assessmentStore.assessment &&
        assessmentStore.assessment.configuracoes.materiaisAnexados
          ? assessmentStore.assessment.configuracoes.materiaisAnexados.arquivos
          : []
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
      :selected-materials="materialsToView"
      @remove-material="(fileId) => {}"
      @edit-material="(file) => {}"
    />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-6">
          <Details v-model="assessmentStore.assessmentState" />

          <AssessmentQuestionList
            v-model:questoes="assessmentStore.assessmentState.questoes"
            :autocorrecao-ativa="
              assessmentStore.assessmentState.configuracoes.autocorrecaoIa
            "
            @adicionar="adicionarQuestao"
            @remover="removerQuestao"
            @adicionar-do-banco="bancoDeQuestoesDialog = true"
            @save-to-bank="handleSaveQuestionToBank"
            @gerar-ia="isGenerateAIDialogOpen = true"
          />
        </div>
        <div class="sticky top-24 space-y-6">
          <Overview :prova="assessmentStore.assessment" />
          <QuickSettings
            v-model="assessmentStore.assessmentState.configuracoes"
          />
        </div>
      </div>
    </div>
  </div>
</template>
