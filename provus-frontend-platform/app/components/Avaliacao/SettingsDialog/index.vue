<script setup lang="ts">
import ViewSelectionDialog from "~/components/Avaliacao/ViewSelectionDialog/index.vue";
import OpenQuestionBankDialog from "~/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import GeneralSettings from "./GeneralSettings.vue";
import SecuritySettings from "./SecuritySettings.vue";
import IaSettings from "./IaSettings.vue";

import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { RandomizationRuleEntity } from "~/types/entities/Configuracoes.entity";
import type { UpdateQuestaoRequest } from "~/types/api/request/Questao.request";

const props = defineProps<{
  modelValue: boolean;
  initialData: AvaliacaoEntity | null;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isViewSelectionDialogOpen = ref(false);
const isBankDialogOpen = ref(false);

const editingPoolQuestion = ref<QuestaoEntity | null>(null);

const configuringRule = ref<RandomizationRuleEntity | null>(null);
const questionsToView = ref<QuestaoEntity[]>([]);

const formState = reactive<Partial<AvaliacaoEntity>>({});

const activeSection = ref("geral");

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const dataCopy = JSON.parse(JSON.stringify(newData));
      if (dataCopy.configuracao?.configuracoesGerais?.dataAgendamento) {
        dataCopy.configuracao.configuracoesGerais.dataAgendamento = new Date(
          dataCopy.configuracao.configuracoesGerais.dataAgendamento
        );
      }
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
  emit("save", formState as AvaliacaoEntity);
  emit("update:modelValue", false);
}

function handleOpenBankDialog({ rule }: { rule: RandomizationRuleEntity }) {
  configuringRule.value = rule;
  isBankDialogOpen.value = true;
}

function handleViewSelection({ rule }: { rule: RandomizationRuleEntity }) {
  questionsToView.value = rule.questoes;
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

function handleBankSelection(selection: { questions: QuestaoEntity[] }) {
  if (configuringRule.value) {
    configuringRule.value.questoes = JSON.parse(
      JSON.stringify(selection.questions)
    );
  }
  configuringRule.value = null;
}

function handleEditFromPool(question: QuestaoEntity) {
  editingPoolQuestion.value = question;
}

function handleUpdateInPool(updatedData: UpdateQuestaoRequest) {
  if (!editingPoolQuestion.value) return;
  const questionInView = questionsToView.value.find(
    (q) => q.id === editingPoolQuestion.value!.id
  );
  if (questionInView) {
    Object.assign(questionInView, updatedData);
  }
  editingPoolQuestion.value = null;
}

function handleFormUpdate(updatedForm: Partial<AvaliacaoEntity>) {
  Object.assign(formState, updatedForm);
}
</script>

<template>
  <UModal
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
          <div v-if="activeSection === 'geral' && formState.configuracao">
            <GeneralSettings
              :form="formState as AvaliacaoEntity"
              @update:form="handleFormUpdate"
              @open-bank-dialog="handleOpenBankDialog"
              @view-selection="handleViewSelection"
            />
          </div>
          <div
            v-else-if="activeSection === 'seguranca' && formState.configuracao"
          >
            <SecuritySettings
              :form="formState as AvaliacaoEntity"
              @update:form="handleFormUpdate"
            />
          </div>
          <div v-else-if="activeSection === 'ia' && formState.configuracao">
            <IaSettings
              :form="formState as AvaliacaoEntity"
              @update:form="handleFormUpdate"
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
          @click="$emit('update:modelValue', false)"
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
