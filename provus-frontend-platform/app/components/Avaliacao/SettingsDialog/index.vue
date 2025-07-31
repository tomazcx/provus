<script setup lang="ts">
import ViewSelectionDialog from "~/components/Avaliacao/ViewSelectionDialog/index.vue";
import OpenQuestionBankDialog from "~/components/Avaliacao/OpenQuestionBankDialog/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";

import type { IQuestao, TQuestionForm } from "~/types/IQuestao";
import type { AvaliacaoImpl } from "~/types/IAvaliacao";
import isFolder from "~/guards/isFolder";
import { useQuestionBankStore } from "~/store/questionBankstore";
import type { IRandomizationRule } from "~/types/IConfiguracoesAvaliacoes";

const props = defineProps<{
  modelValue: boolean;
  initialData: AvaliacaoImpl;
}>();

const emit = defineEmits(["update:modelValue", "save"]);
const questionBankStore = useQuestionBankStore();

const isViewSelectionDialogOpen = ref(false);
const isBankDialogOpen = ref(false);

const editingPoolQuestion = ref<IQuestao | null>(null);
const poolQuestoes = ref<IQuestao[]>([]);
const configuringRuleId = ref<number | null>(null);

const questionsToView = ref<IQuestao[]>([]);

const formState = reactive<Partial<AvaliacaoImpl>>({});

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

watch(
  () => formState.configuracoes?.randomizacaoBancoSimples,
  (newValue) => {
    if (newValue && formState.configuracoes) {
      formState.configuracoes.randomizacaoBancoConfiguravel = false;
    }
  }
);
watch(
  () => formState.configuracoes?.randomizacaoBancoConfiguravel,
  (newValue) => {
    if (newValue && formState.configuracoes) {
      formState.configuracoes.randomizacaoBancoSimples = false;
    }
  }
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
    key: "regras",
    label: "Regras",
    icon: "i-lucide-gavel",
    active: activeSection.value === "regras",
    click: () => (activeSection.value = "regras"),
  },
  {
    key: "agendamento",
    label: "Agendamento",
    icon: "i-lucide-calendar-clock",
    active: activeSection.value === "agendamento",
    click: () => (activeSection.value = "agendamento"),
  },
]);

const activeSection = ref("geral");

function handleSave() {
  emit("save", formState);
  emit("update:modelValue", false);
}

function openBankForRule(ruleId: number) {
  configuringRuleId.value = ruleId;
  isBankDialogOpen.value = true;
}

function handleBankSelection(selection: {
  questions: IQuestao[];
  rawSelection: { folders: number[]; questions: number[] };
}) {
  if (configuringRuleId.value !== null) {
    const rule = formState.configuracoes?.regrasRandomizacaoConfiguravel?.find(
      (r) => r.id === configuringRuleId.value
    );
    if (rule) {
      rule.grupo.pastas = selection.rawSelection.folders;
      rule.grupo.questoes = selection.rawSelection.questions;
    }
    configuringRuleId.value = null;
  } else {
    poolQuestoes.value = selection.questions.map((q) =>
      JSON.parse(JSON.stringify(q))
    );
  }
}

function handleRemoveFromPool(questionId: number) {
  const index = poolQuestoes.value.findIndex((q) => q.id === questionId);
  if (index > -1) {
    poolQuestoes.value.splice(index, 1);
  }
}

function handleEditFromPool(question: IQuestao) {
  editingPoolQuestion.value = question;
}

function handleUpdateInPool(updatedData: TQuestionForm) {
  if (!editingPoolQuestion.value) return;
  const index = poolQuestoes.value.findIndex(
    (q) => q.id === editingPoolQuestion.value!.id
  );
  if (index !== -1) {
    const updatedQuestion = { ...poolQuestoes.value[index], ...updatedData };
    poolQuestoes.value[index] = updatedQuestion;
  }
  editingPoolQuestion.value = null;
}
function addRule() {
  formState.configuracoes?.regrasRandomizacaoConfiguravel?.push({
    id: Date.now(),
    quantidade: 1,
    dificuldade: "Qualquer",
    grupo: { pastas: [], questoes: [] },
  });
}

function removeRule(ruleId: number) {
  if (!formState.configuracoes?.regrasRandomizacaoConfiguravel) return;

  formState.configuracoes.regrasRandomizacaoConfiguravel =
    formState.configuracoes.regrasRandomizacaoConfiguravel.filter(
      (rule) => rule.id !== ruleId
    );
}

function viewSimplePool() {
  questionsToView.value = poolQuestoes.value;
  isViewSelectionDialogOpen.value = true;
}

function viewConfigurableGroup(rule: IRandomizationRule) {
  const finalQuestionIds = new Set<number>(rule.grupo.questoes);

  rule.grupo.pastas.forEach((folderId: number) => {
    const folder = questionBankStore.items.find((i) => i.id === folderId);
    if (folder && isFolder(folder)) {
      const pathPrefix =
        folder.path === "/"
          ? `/${folder.titulo}`
          : `${folder.path}/${folder.titulo}`;
      questionBankStore.items.forEach((item) => {
        if (item.path?.startsWith(pathPrefix) && !isFolder(item)) {
          finalQuestionIds.add(item.id!);
        }
      });
    }
  });

  questionsToView.value = questionBankStore.items.filter(
    (item) => item.id && finalQuestionIds.has(item.id)
  ) as IQuestao[];

  isViewSelectionDialogOpen.value = true;
}
</script>

<template>
  <UModal
    title="Configurações da Avaliação"
    description="Ajuste os detalhes e regras da sua prova"
    class="min-w-5xl min-h-[900px]"
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
          <div v-if="activeSection === 'geral' && formState.configuracoes">
            <div class="w-full flex flex-col gap-6">
              <UCard variant="subtle">
                <template #header
                  ><h2 class="font-bold">Gerenciamento de tempo</h2></template
                >
                <div class="flex justify-between gap-4">
                  <UFormField label="Tempo mínimo (minutos)">
                    <UInput
                      v-model.number="formState.configuracoes.tempoMinimo"
                      type="number"
                    />
                  </UFormField>
                  <UFormField label="Duração da avaliação (minutos)">
                    <UInput
                      v-model.number="formState.configuracoes.tempoMaximo"
                      type="number"
                    />
                  </UFormField>
                </div>
              </UCard>
              <UCard variant="subtle">
                <template #header
                  ><h2 class="font-bold">Questões randômicas</h2></template
                >
                <div class="flex flex-col gap-6">
                  <USwitch
                    v-model="formState.configuracoes.randomizacaoSimples"
                    label="Randomização simples"
                    description="Apenas embaralha as questões e alternativas que você adicionou na prova. Cada estudante terá a mesma prova, mas com questões e alternativas em ordem aleatória."
                  />
                  <div class="flex flex-col gap-3">
                    <USwitch
                      v-model="formState.configuracoes.randomizacaoBancoSimples"
                      label="Randomização simples do banco de questões"
                      description="Selecione um grupo de questões ou pastas que contenham as questões que serão aleatoriamente escolhidas para cada aluno. Quanto maior o número de questões, maior a diversidade."
                    />
                    <div
                      v-if="formState.configuracoes.randomizacaoBancoSimples"
                      class="pl-8 flex items-center gap-3"
                    >
                      <UButton
                        label="Selecionar do Banco"
                        variant="outline"
                        icon="i-lucide-database"
                        @click="isBankDialogOpen = true"
                      />
                      <UButton
                        v-if="poolQuestoes.length > 0"
                        :label="`${poolQuestoes.length} questões selecionadas`"
                        variant="link"
                        color="primary"
                        trailing-icon="i-lucide-eye"
                        @click="viewSimplePool"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col gap-3">
                    <USwitch
                      v-model="
                        formState.configuracoes.randomizacaoBancoConfiguravel
                      "
                      label="Randomização configurável do banco de questões"
                      description="Controle a quantidade de questões de um determinado grupo e dificuldade."
                    />

                    <div
                      v-if="
                        formState.configuracoes.randomizacaoBancoConfiguravel
                      "
                      class="pl-8 flex flex-col gap-4"
                    >
                      <div
                        v-for="rule in formState.configuracoes
                          .regrasRandomizacaoConfiguravel"
                        :key="rule.id"
                        class="flex items-center gap-1 text-sm"
                      >
                        Gerar
                        <UInputNumber v-model="rule.quantidade" class="w-20" />
                        Questões do grupo

                        <UButton
                          v-if="
                            rule.grupo.pastas.length > 0 ||
                            rule.grupo.questoes.length > 0
                          "
                          label="Ver Seleção"
                          variant="outline"
                          size="xs"
                          class="flex-shrink-0"
                          @click="viewConfigurableGroup(rule)"
                        />

                        <UButton
                          v-else
                          label="Selecionar"
                          variant="outline"
                          size="xs"
                          icon="i-lucide-database"
                          class="flex-shrink-0"
                          @click="openBankForRule(rule.id!)"
                        />

                        de dificuldade
                        <USelect
                          v-model="rule.dificuldade"
                          :items="['Qualquer', 'Fácil', 'Médio', 'Difícil']"
                          class="w-32"
                        />
                        <UButton
                          color="error"
                          variant="ghost"
                          icon="i-lucide-x"
                          class="-mr-2"
                          @click="removeRule(rule.id!)"
                        />
                      </div>

                      <UButton
                        label="Adicionar Configuração"
                        variant="outline"
                        icon="i-lucide-plus"
                        class="w-fit"
                        @click="addRule"
                      />
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
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
    @remove-question="handleRemoveFromPool"
    @edit-question="handleEditFromPool"
  />

  <EditQuestionDialog
    :model-value="!!editingPoolQuestion"
    :question="editingPoolQuestion"
    @update:model-value="editingPoolQuestion = null"
    @update:question="handleUpdateInPool"
  />
</template>
