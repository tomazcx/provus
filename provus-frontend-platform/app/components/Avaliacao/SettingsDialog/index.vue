<script setup lang="ts">
import ViewSelectionDialog from "~/components/Avaliacao/ViewSelectionDialog/index.vue";
import OpenQuestionBankDialog from "~/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import GeneralSettings from "./GeneralSettings.vue";
import SecuritySettings from "./SecuritySettings.vue";
import OpenMaterialsBankDialog from "~/components/Avaliacao/OpenMaterialsBankDialog/index.vue";
import ViewAttachedMaterialsDialog from "~/components/Avaliacao/ViewAttachedMaterialsDialog/index.vue";
import EditFileDialog from "~/components/BancoDeMateriais/EditFileDialog/index.vue";

import type { IQuestao, TQuestionForm } from "~/types/IQuestao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type {
  IRandomizationRule,
  IRegraGeracaoIA,
} from "~/types/IConfiguracoesAvaliacoes";
import type { IFile } from "~/types/IFile";

const props = defineProps<{
  modelValue: boolean;
  initialData: IAvaliacaoImpl;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isViewSelectionDialogOpen = ref(false);
const isBankDialogOpen = ref(false);
const isMaterialsBankDialogOpen = ref(false);
const isViewMaterialsDialogOpen = ref(false);
const configuringIaRule = ref<IRegraGeracaoIA | null>(null);
const materialsToView = ref<IFile[]>([]);
const viewingIaRule = ref<IRegraGeracaoIA | null>(null);

const editingPoolQuestion = ref<IQuestao | null>(null);
const editingAttachedMaterial = ref<IFile | null>(null);

const configuringRuleId = ref<number | null>(null);

const questionsToView = ref<IQuestao[]>([]);

const formState = reactive<Partial<IAvaliacaoImpl>>({});

const activeSection = ref("geral");

const poolQuestoesCount = computed(() => {
  return formState.configuracoes?.poolSelecaoBanco.questoes.length || 0;
});

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const dataCopy = JSON.parse(JSON.stringify(newData));
      Object.assign(formState, dataCopy);
    }
  },
  { immediate: true, deep: true }
);

const menuItems = computed(() => [
  {
    key: "geral",
    label: "Geral",
    icon: "i-lucide-file-text",
    active: activeSection.value === "geral",
    click: () => (activeSection.value = "geral"),
  },
  {
    key: "seguranca",
    label: "Segurança",
    icon: "i-lucide-gavel",
    active: activeSection.value === "seguranca",
    click: () => (activeSection.value = "seguranca"),
  },
  {
    key: "ia",
    label: "I.A",
    icon: "i-lucide-brain-circuit",
    active: activeSection.value === "ia",
    click: () => (activeSection.value = "ia"),
  },
]);

function handleSave() {
  emit("save", formState);
  emit("update:modelValue", false);
}

function handleOpenBankDialog({
  context,
  ruleId,
}: {
  context: string;
  ruleId?: number;
}) {
  if (context === "configurable" && ruleId) {
    configuringRuleId.value = ruleId;
  } else {
    configuringRuleId.value = null;
  }
  isBankDialogOpen.value = true;
}

function handleViewSelection({
  context,
  rule,
}: {
  context: string;
  rule?: IRandomizationRule;
}) {
  if (context === "simple") {
    questionsToView.value =
      formState.configuracoes?.poolSelecaoBanco.questoes || [];
  } else if (context === "configurable" && rule) {
    questionsToView.value = rule.grupo.questoes;
  }
  isViewSelectionDialogOpen.value = true;
}

function handleRemoveFromSelection(questionIdToRemove: number) {
  const index = questionsToView.value.findIndex(
    (q) => q.id === questionIdToRemove
  );
  if (index > -1) {
    questionsToView.value.splice(index, 1);
  }
}

function handleBankSelection(selection: {
  questions: IQuestao[];
  rawSelection: { folders: number[]; questions: number[] };
}) {
  const questionClones = selection.questions.map((q) =>
    JSON.parse(JSON.stringify(q))
  );

  if (configuringRuleId.value !== null) {
    const rule = formState.configuracoes?.regrasRandomizacaoConfiguravel?.find(
      (r) => r.id === configuringRuleId.value
    );
    if (rule) {
      rule.grupo.questoes = questionClones;
      rule.grupo.pastas = selection.rawSelection.folders;
    }
    configuringRuleId.value = null;
  } else {
    if (formState.configuracoes) {
      formState.configuracoes.poolSelecaoBanco.questoes = questionClones;
      formState.configuracoes.poolSelecaoBanco.pastas =
        selection.rawSelection.folders;
    }
  }
}

function handleEditFromPool(question: IQuestao) {
  editingPoolQuestion.value = question;
}

function handleUpdateInPool(updatedData: TQuestionForm) {
  if (!editingPoolQuestion.value) return;
  const questionInView = questionsToView.value.find(
    (q) => q.id === editingPoolQuestion.value!.id
  );
  if (questionInView) {
    Object.assign(questionInView, updatedData);
  }
  editingPoolQuestion.value = null;
}

function handleOpenMaterialsBank() {
  isMaterialsBankDialogOpen.value = true;
}

function handleOpenMaterialsBankForRule(rule: IRegraGeracaoIA) {
  configuringIaRule.value = rule;
  isMaterialsBankDialogOpen.value = true;
}

function handleEditMaterial(fileToEdit: IFile) {
  editingAttachedMaterial.value = fileToEdit;
}

function handleUpdateMaterial(updatedData: Partial<IFile>) {
  if (!editingAttachedMaterial.value) return;

  const originalFile =
    formState.configuracoes?.materiaisAnexados?.arquivos.find(
      (f) => f.id === editingAttachedMaterial.value!.id
    );

  if (originalFile) {
    Object.assign(originalFile, updatedData);
  }

  editingAttachedMaterial.value = null;
}

function handleFormUpdate(updatedForm: Partial<IAvaliacaoImpl>) {
  Object.assign(formState, updatedForm);
}

function handleViewMaterials() {
  viewingIaRule.value = null;
  isViewMaterialsDialogOpen.value = true;
}

function handleMaterialsBankSelection(selection: {
  files: IFile[];
  rawSelection: { folders: number[]; files: number[] };
}) {
  if (configuringIaRule.value) {
    const selectedFileIds = selection.files.map((f) => f.id!);

    selection.files.forEach((file) => {
      const anexoExistente =
        formState.configuracoes?.materiaisAnexados?.arquivos.find(
          (f) => f.id === file.id
        );
      if (!anexoExistente) {
        formState.configuracoes?.materiaisAnexados?.arquivos.push(file);
      }
    });

    configuringIaRule.value.materiaisAnexadosIds = selectedFileIds;
    configuringIaRule.value = null;
  } else {
    if (formState.configuracoes?.materiaisAnexados) {
      formState.configuracoes.materiaisAnexados.arquivos.push(
        ...selection.files
      );
      formState.configuracoes.materiaisAnexados.pastas =
        selection.rawSelection.folders;
    }
  }
}

function handleRemoveMaterial(fileId: number) {
  if (viewingIaRule.value) {
    const index = viewingIaRule.value.materiaisAnexadosIds.indexOf(fileId);
    if (index > -1) {
      viewingIaRule.value.materiaisAnexadosIds.splice(index, 1);
    }
    const viewIndex = materialsToView.value.findIndex((m) => m.id === fileId);
    if (viewIndex > -1) {
      materialsToView.value.splice(viewIndex, 1);
    }
    if (materialsToView.value.length === 0) {
      isViewMaterialsDialogOpen.value = false;
    }
  } else {
    if (formState.configuracoes?.materiaisAnexados) {
      const { arquivos } = formState.configuracoes.materiaisAnexados;
      const index = arquivos.findIndex((f) => f.id === fileId);
      if (index > -1) {
        arquivos.splice(index, 1);
      }
    }
  }
}

function handleViewMaterialForRule(rule: IRegraGeracaoIA) {
  if (rule.materiaisAnexadosIds && rule.materiaisAnexadosIds.length > 0) {
    const materiais =
      formState.configuracoes?.materiaisAnexados?.arquivos.filter((m) =>
        rule.materiaisAnexadosIds.includes(m.id!)
      );
    if (materiais && materiais.length > 0) {
      viewingIaRule.value = rule;
      materialsToView.value = materiais;
      isViewMaterialsDialogOpen.value = true;
    }
  }
}
</script>

<template>
  <UModal
    title="Configurações da Avaliação"
    description="Ajuste os detalhes e regras da sua prova"
    class="min-w-[1080px] min-h-[900px]"
    :open="modelValue"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-settings-2" class="text-white text-2xl" />
        </div>
        <div>
          <h2 class="text-xl font-bold">Configurações da Avaliação</h2>
          <p class="text-sm text-gray-500">
            Ajuste os detalhes e regras da sua prova.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex gap-8 py-4 max-h-[700px]">
        <nav class="w-56 space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.key"
            class="w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors"
            :class="[
              item.active
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-gray-100 text-gray-700',
            ]"
            @click="item.click"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
        <div
          class="flex-1 border-l border-gray-200 pl-8 overflow-auto max-h-[700px]"
        >
          <div v-if="activeSection === 'geral'">
            <GeneralSettings
              :form="formState"
              :pool-questoes-count="poolQuestoesCount"
              @update:form="handleFormUpdate"
              @open-bank-dialog="handleOpenBankDialog"
              @view-selection="handleViewSelection"
              @open-materials-bank="handleOpenMaterialsBank"
              @view-materials="handleViewMaterials"
            />
          </div>
          <div v-else-if="activeSection === 'seguranca'">
            <SecuritySettings
              v-model:form="formState"
              :pool-questoes-count="poolQuestoesCount"
              @open-bank-dialog="handleOpenBankDialog"
              @view-selection="handleViewSelection"
            />
          </div>
          <div v-else-if="activeSection === 'ia'">
            <IaSettings
              :form="formState"
              @update:form="handleFormUpdate"
              @open-materials-bank-for-rule="handleOpenMaterialsBankForRule"
              @view-material-for-rule="handleViewMaterialForRule"
            />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="primary"
          @click="emit('update:modelValue', false)"
          >Cancelar</UButton
        >
        <UButton color="primary" @click="handleSave"
          >Salvar Configurações</UButton
        >
      </div>
    </template>
  </UModal>

  <OpenQuestionBankDialog
    v-model="isBankDialogOpen"
    @add-questions="handleBankSelection"
  />

  <ViewSelectionDialog
    v-model="isViewSelectionDialogOpen"
    :selected-questions="questionsToView"
    @remove-question="handleRemoveFromSelection"
    @edit-question="handleEditFromPool"
  />

  <EditQuestionDialog
    :model-value="!!editingPoolQuestion"
    :question="editingPoolQuestion"
    @update:model-value="editingPoolQuestion = null"
    @update:question="handleUpdateInPool"
  />

  <OpenMaterialsBankDialog
    v-model="isMaterialsBankDialogOpen"
    @add-materials="handleMaterialsBankSelection"
  />

  <ViewAttachedMaterialsDialog
    v-model="isViewMaterialsDialogOpen"
    :selected-materials="
      materialsToView.length > 0
        ? materialsToView
        : formState.configuracoes?.materiaisAnexados?.arquivos || []
    "
    @remove-material="handleRemoveMaterial"
    @edit-material="handleEditMaterial"
  />

  <EditFileDialog
    :model-value="!!editingAttachedMaterial"
    :file="editingAttachedMaterial"
    @update:model-value="editingAttachedMaterial = null"
    @update:file="handleUpdateMaterial"
  />
</template>
