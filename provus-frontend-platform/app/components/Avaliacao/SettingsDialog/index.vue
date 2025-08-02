<script setup lang="ts">
import ViewSelectionDialog from "~/components/Avaliacao/ViewSelectionDialog/index.vue";
import OpenQuestionBankDialog from "~/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import GeneralSettings from "./GeneralSettings.vue";
import SecuritySettings from "./SecuritySettings.vue";

import type { IQuestao, TQuestionForm } from "~/types/IQuestao";
import type { AvaliacaoImpl } from "~/types/IAvaliacao";
import type { IRandomizationRule } from "~/types/IConfiguracoesAvaliacoes";

const props = defineProps<{
  modelValue: boolean;
  initialData: AvaliacaoImpl;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isViewSelectionDialogOpen = ref(false);
const isBankDialogOpen = ref(false);

const editingPoolQuestion = ref<IQuestao | null>(null);
const configuringRuleId = ref<number | null>(null);

const questionsToView = ref<IQuestao[]>([]);

const formState = reactive<Partial<AvaliacaoImpl>>({});

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
      <div class="flex gap-8 py-4">
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
        <div class="flex-1 border-l border-gray-200 pl-8">
          <div v-if="activeSection === 'geral'">
            <GeneralSettings
              v-model:form="formState"
              :pool-questoes-count="poolQuestoesCount"
              @open-bank-dialog="handleOpenBankDialog"
              @view-selection="handleViewSelection"
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
</template>
