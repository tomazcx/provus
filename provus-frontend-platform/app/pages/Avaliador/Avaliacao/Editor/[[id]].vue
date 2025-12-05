<script setup lang="ts">
import Details from "@/components/Avaliacao/Details/index.vue";
import AssessmentQuestionList from "@/components/Avaliacao/AssessmentQuestionList/index.vue";
import Overview from "@/components/Avaliacao/Overview/index.vue";
import QuickSettings from "@/components/Avaliacao/QuickSettings/index.vue";
import SettingsDialog from "@/components/Avaliacao/SettingsDialog/index.vue";
import EditFileDialog from "~/components/BancoDeMateriais/EditFileDialog/index.vue";
import OpenQuestionBankDialog from "@/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import SaveToExamBankDialog from "@/components/BancoDeAvaliacoes/SaveToExamBankDialog/index.vue";
import SaveToQuestionsBankDialog from "@/components/Avaliacao/SaveToQuestionsBankDialog/index.vue";
import GenerateQuestionsIaDialog from "@/components/Avaliacao/GenerateQuestionsIaDialog/index.vue";
import OpenMaterialsBankDialog from "@/components/Avaliacao/OpenMaterialsBankDialog/index.vue";
import ViewAttachedMaterialsDialog from "@/components/Avaliacao/ViewAttachedMaterialsDialog/index.vue";
import StartApplicationDialog from "@/components/Aplicacoes/StartApplicationDialog/index.vue";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";
import { useAssessmentStore } from "~/store/assessmentStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import { useEditorBridgeStore } from "~/store/editorBridgeStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

definePageMeta({
  layout: "assessment-editor",
});

interface TemaForm {
  assunto: string;
  quantidade: number;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
}

const assessmentStore = useAssessmentStore();
const applicationsStore = useApplicationsStore();
const editorBridgeStore = useEditorBridgeStore();
const examBankStore = useExamBankStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const bancoDeQuestoesDialog = ref(false);
const saveToBankDialog = ref(false);
const questionToSave = ref<QuestaoEntity | null>(null);
const isGenerateAIDialogOpen = ref(false);
const isSaveToExamBankDialogOpen = ref(false);
const applicationToStart = ref<AplicacaoEntity | null>(null);
const isMaterialsBankDialogOpen = ref(false);
const isViewMaterialsDialogOpen = ref(false);
const configuringIaRule = ref<RegraGeracaoIaEntity | null>(null);
const editingAttachedMaterial = ref<ArquivoEntity | null>(null);

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
  editorBridgeStore.setContext({
    origin: route.query.origin as string | null,
  });

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

  const isScheduling = action.key.includes("schedule");
  const isApplying = action.key.includes("apply");
  const shouldSaveToBank = action.key.startsWith("save");

  if (isScheduling) {
    const configGerais =
      assessmentStore.assessmentState.configuracao.configuracoesGerais;

    if (!configGerais.dataAgendamento) {
      toast.add({
        title: "Data não definida",
        description:
          "Para agendar, você deve definir uma data nas configurações.",
        color: "error",
        icon: "i-lucide-calendar-x",
      });
      assessmentStore.openSettingsDialog();
      return;
    }

    const agendamentoDate = new Date(configGerais.dataAgendamento);
    if (agendamentoDate <= new Date()) {
      toast.add({
        title: "Data Inválida",
        description: "A data de agendamento deve ser no futuro.",
        color: "warning",
        icon: "i-lucide-clock",
      });
      assessmentStore.openSettingsDialog();
      return;
    }
  }

  if (shouldSaveToBank) {
    assessmentStore.assessmentState.isModelo = true;

    const savedAssessment = await assessmentStore.saveOrUpdateAssessment();

    if (savedAssessment) {
      if (examBankStore.rootFolderId) {
        const targetFolderId =
          savedAssessment.paiId ?? examBankStore.rootFolderId;
        await examBankStore.fetchFolderContent(targetFolderId);
      }

      if (isApplying || isScheduling) {
        const newApp = await applicationsStore.createApplication(
          savedAssessment,
          false
        );

        if (newApp) {
          if (isApplying) {
            applicationToStart.value = newApp;
          } else {
            toast.add({
              title: "Agendamento Realizado",
              description: `Avaliação salva e agendada.`,
              color: "success",
              icon: "i-lucide-calendar-check",
            });
            router.push("/aplicacoes");
          }
        }
      } else {
        toast.add({
          title: "Sucesso",
          description: "Modelo de avaliação salvo com sucesso.",
          color: "secondary",
        });
      }
    }
  } else {
    const newApp = await applicationsStore.createApplication(
      assessmentStore.assessmentState,
      true
    );

    if (newApp) {
      if (isApplying) {
        applicationToStart.value = newApp;
      } else {
        toast.add({
          title: "Agendamento Realizado",
          description: "Avaliação agendada (versão única).",
          color: "success",
          icon: "i-lucide-calendar-check",
        });
        router.push("/aplicacoes");
      }
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
async function handleAIGeneration(regras: RegraGeracaoIaEntity[]) {
  const validRules = regras.filter(
    (r) => r.materiaisAnexadosIds && r.materiaisAnexadosIds.length > 0
  );

  if (validRules.length === 0) {
    toast.add({
      title: "Atenção",
      description: "Nenhuma regra possuía materiais selecionados.",
      color: "warning",
    });
    return;
  }

  isGenerateAIDialogOpen.value = false;

  for (const regra of validRules) {
    const formData = new FormData();
    formData.append("dificuldade", regra.dificuldade);
    formData.append("tipoQuestao", regra.tipo);
    formData.append("quantidade", regra.quantidade.toString());
    formData.append("assunto", regra.assunto || "");

    regra.materiaisAnexadosIds.forEach((id) => {
      formData.append("arquivoIds", id.toString());
    });

    assessmentStore.generateQuestionsStreamFromFile(formData, regra.quantidade);
  }
}

function handleAIGenerationByTopic(regras: TemaForm[]) {
  isGenerateAIDialogOpen.value = false;

  for (const regra of regras) {
    const payload = {
      assunto: regra.assunto,
      quantidade: regra.quantidade,
      tipoQuestao: regra.tipo,
      dificuldade: regra.dificuldade,
      pontuacao: regra.pontuacao,
    };

    assessmentStore.generateQuestionsStream(payload);
  }
}

function handleOpenMaterialsBankForIa(rule: RegraGeracaoIaEntity) {
  configuringIaRule.value = rule;
  isMaterialsBankDialogOpen.value = true;
}

function handleViewMaterialsForIa(rule: RegraGeracaoIaEntity) {
  console.log("Visualizar materiais para a regra:", rule);
}

function handleMaterialsSelection(selection: { files: ArquivoEntity[] }) {
  if (!assessmentStore.assessmentState) return;

  if (configuringIaRule.value) {
    const selectedFileIds = selection.files.map((f) => f.id);

    selection.files.forEach((file) => {
      const anexoExistente = assessmentStore.assessmentState!.arquivos.some(
        (aw) => aw.arquivo.id === file.id
      );
      if (!anexoExistente) {
        assessmentStore.assessmentState!.arquivos.push({
          arquivo: file,
          permitirConsultaPorEstudante: false,
        });
      }
    });

    configuringIaRule.value.materiaisAnexadosIds = selectedFileIds;
    configuringIaRule.value = null;
  } else {
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
    toast.add({
      title: `${selection.files.length} material(is) anexado(s) à prova.`,
      icon: "i-lucide-check-circle",
      color: "secondary",
    });
  }
}

function handleRemoveMaterial(fileId: number) {
  if (!assessmentStore.assessmentState) return;
  const index = assessmentStore.assessmentState.arquivos.findIndex(
    (aw) => aw.arquivo.id === fileId
  );
  if (index > -1) {
    assessmentStore.assessmentState.arquivos.splice(index, 1);
  }
}

function handleEditMaterial(fileToEdit: ArquivoEntity) {
  isViewMaterialsDialogOpen.value = false;
  editingAttachedMaterial.value = fileToEdit;
}

function openMaterialsBankForConsultation() {
  configuringIaRule.value = null;
  isMaterialsBankDialogOpen.value = true;
}

function handleUpdateMaterial(updatedData: Partial<ArquivoEntity>) {
  if (!editingAttachedMaterial.value || !assessmentStore.assessmentState)
    return;
  const originalFileWrapper = assessmentStore.assessmentState.arquivos.find(
    (aw) => aw.arquivo.id === editingAttachedMaterial.value!.id
  );

  if (originalFileWrapper) {
    Object.assign(originalFileWrapper.arquivo, updatedData);
  }
  editingAttachedMaterial.value = null;
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
          :is-loading="assessmentStore.isSaving"
          @generate="handleAIGeneration"
          @generate-by-topic="handleAIGenerationByTopic"
          @open-materials-bank="handleOpenMaterialsBankForIa"
          @view-materials="handleViewMaterialsForIa"
        />

        <OpenMaterialsBankDialog
          v-model="isMaterialsBankDialogOpen"
          @add-materials="handleMaterialsSelection"
        />

        <ViewAttachedMaterialsDialog
          v-model="isViewMaterialsDialogOpen"
          :selected-materials="assessmentStore.assessmentState.arquivos"
          @remove-material="handleRemoveMaterial"
          @edit-material="handleEditMaterial"
        />

        <EditFileDialog
          :model-value="!!editingAttachedMaterial"
          :file="editingAttachedMaterial"
          @update:model-value="editingAttachedMaterial = null"
          @update:file="handleUpdateMaterial"
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
                :randomization-rules="
                  assessmentStore.assessmentState.configuracao
                    .configuracoesGerais.configuracoesRandomizacao
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

              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold">Materiais Anexados</h3>
                </template>
                <div class="space-y-3">
                  <p class="text-sm text-gray-500">
                    {{ assessmentStore.assessmentState.arquivos.length }}
                    arquivo(s) anexado(s).
                  </p>
                  <UButton
                    label="Anexar Material"
                    icon="i-lucide-plus"
                    variant="solid"
                    color="secondary"
                    block
                    @click="openMaterialsBankForConsultation"
                  />
                  <UButton
                    label="Gerenciar Materiais"
                    icon="i-lucide-file-cog"
                    variant="outline"
                    block
                    @click="isViewMaterialsDialogOpen = true"
                  />
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
