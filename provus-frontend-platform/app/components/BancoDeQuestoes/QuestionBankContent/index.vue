<script setup lang="ts">
import QuestionsBankFolderItem from "~/components/BancoDeQuestoes/QuestionsBankFolderItem/index.vue";
import QuestionsBankQuestionItem from "~/components/BancoDeQuestoes/QuestionsBankQuestionItem/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import GenerateQuestionsIaDialog from "@/components/Avaliacao/GenerateQuestionsIaDialog/index.vue";
import OpenMaterialsBankDialog from "@/components/Avaliacao/OpenMaterialsBankDialog/index.vue";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import { useQuestionBankStore } from "~/store/questionBankstore";
import type {
  CreateQuestaoRequest,
  UpdateQuestaoRequest,
  GenerateAndSaveAiQuestaoRequest,
} from "~/types/api/request/Questao.request";
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import TipoItemEnum from "~/enums/TipoItemEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";

function isFolder(item: QuestaoEntity | FolderEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

function isQuestion(item: QuestaoEntity | FolderEntity): item is QuestaoEntity {
  return item.tipo === TipoItemEnum.QUESTAO;
}

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});

const questionBankStore = useQuestionBankStore();
const toast = useToast();

onMounted(() => {
  questionBankStore.initializeWebSocket();
});

const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);
const showGenerateAiDialog = ref(false);
const showMaterialsBankDialog = ref(false);
const configuringIaRule = ref<RegraGeracaoIaEntity | null>(null);
const editingItem = ref<QuestaoEntity | FolderEntity | null>(null);

const selectedItems = ref({
  folders: new Set<number>(),
  questions: new Set<number>(),
});

const filters = reactive({
  search: "",
  type: "Todos os tipos",
  difficulty: "Todas as dificuldades",
  sort: "Última modificação",
});

const typeOptions = [
  "Todos os tipos",
  "Múltipla Escolha",
  "Objetiva",
  "Verdadeiro ou Falso",
  "Discursiva",
];

const difficultyOptions = [
  "Todas as dificuldades",
  DificuldadeQuestaoEnum.FACIL,
  DificuldadeQuestaoEnum.MEDIO,
  DificuldadeQuestaoEnum.DIFICIL,
];

const sortOptions = [
  "Última modificação",
  "Ordem alfabética A-Z",
  "Ordem alfabética Z-A",
  "Mais Recente",
  "Mais Antigo",
];

function handleItemClick(item: QuestaoEntity | FolderEntity) {
  if (isFolder(item)) {
    questionBankStore.navigateToFolder(item);
  } else if (props.mode === "select") {
    handleSelectItem(item);
  }
}

function handleSelectItem(item: QuestaoEntity | FolderEntity) {
  if (!item.id) return;
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.questions;

  if (targetSet.has(item.id)) {
    targetSet.delete(item.id);
  } else {
    targetSet.add(item.id);
  }
}

function handleCreateFolder(data: { titulo: string }) {
  questionBankStore.createFolder(data);
  showCreateFolder.value = false;
}

function handleCreateQuestion(formData: CreateQuestaoRequest) {
  questionBankStore.createQuestion(formData);
  showCreateQuestion.value = false;
}

function handleUpdate(
  updatedData: { newTitle: string } | UpdateQuestaoRequest
) {
  if (!editingItem.value) return;
  const dataToSend =
    "newTitle" in updatedData ? { titulo: updatedData.newTitle } : updatedData;

  questionBankStore.updateItem(editingItem.value, dataToSend);
  editingItem.value = null;
}

function handleDelete(itemToDelete: QuestaoEntity | FolderEntity) {
  questionBankStore.deleteItem(itemToDelete);
}

function handleOpenMaterialsBank(rule: RegraGeracaoIaEntity) {
  configuringIaRule.value = rule;
  showMaterialsBankDialog.value = true;
}

function handleMaterialsSelection(selection: { files: ArquivoEntity[] }) {
  if (configuringIaRule.value) {
    const selectedFileIds = selection.files.map((f) => f.id);
    configuringIaRule.value.materiaisAnexadosIds = selectedFileIds;

    toast.add({
      title: "Materiais vinculados",
      description: `${selectedFileIds.length} arquivo(s) selecionado(s) para a regra.`,
      color: "secondary",
      icon: "i-lucide-paperclip",
    });

    configuringIaRule.value = null;
  }
}

async function handleAiGeneration(regras: RegraGeracaoIaEntity[]) {
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

  showGenerateAiDialog.value = false;

  for (const regra of validRules) {
    const formData = new FormData();
    formData.append("dificuldade", regra.dificuldade);
    formData.append("tipoQuestao", regra.tipo);
    formData.append("quantidade", regra.quantidade.toString());
    formData.append("assunto", regra.assunto || "");

    regra.materiaisAnexadosIds.forEach((id) => {
      formData.append("arquivoIds", id.toString());
    });

    questionBankStore.startFileGenerationStream(formData, regra.quantidade);
  }
}

const breadcrumbItems = computed(() =>
  questionBankStore.breadcrumbs.map((crumb, index) => ({
    label: crumb.titulo,
    click: () => questionBankStore.navigateToBreadcrumb(index),
    disabled: index === questionBankStore.breadcrumbs.length - 1,
  }))
);

const currentPathLabel = computed(() =>
  questionBankStore.breadcrumbs.map((c) => c.titulo).join(" > ")
);

const filteredItems = computed(() => {
  let result = [...questionBankStore.items];

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.toLowerCase();
    result = result.filter((item) => item.titulo.toLowerCase().includes(term));
  }

  if (filters.type !== "Todos os tipos") {
    const typeMap: Record<string, TipoQuestaoEnum> = {
      "Múltipla Escolha": TipoQuestaoEnum.MULTIPLA_ESCOLHA,
      Objetiva: TipoQuestaoEnum.OBJETIVA,
      "Verdadeiro ou Falso": TipoQuestaoEnum.VERDADEIRO_FALSO,
      Discursiva: TipoQuestaoEnum.DISCURSIVA,
    };
    const targetType = typeMap[filters.type];
    if (targetType) {
      result = result.filter(
        (item) => isQuestion(item) && item.tipoQuestao === targetType
      );
    }
  }

  if (filters.difficulty !== "Todas as dificuldades") {
    result = result.filter(
      (item) => isQuestion(item) && item.dificuldade === filters.difficulty
    );
  }

  result.sort((a, b) => {
    const dateUpdatedA = new Date(a.atualizadoEm).getTime();
    const dateUpdatedB = new Date(b.atualizadoEm).getTime();
    const dateCreatedA = new Date(a.criadoEm).getTime();
    const dateCreatedB = new Date(b.criadoEm).getTime();

    switch (filters.sort) {
      case "Última modificação":
        return dateUpdatedB - dateUpdatedA;
      case "Ordem alfabética A-Z":
        return a.titulo.localeCompare(b.titulo);
      case "Ordem alfabética Z-A":
        return b.titulo.localeCompare(a.titulo);
      case "Mais Recente":
        return dateCreatedB - dateCreatedA;
      case "Mais Antigo":
        return dateCreatedA - dateCreatedB;
      default:
        return 0;
    }
  });

  if (filters.type === "Todos os tipos") {
    result.sort((a, b) => {
      if (a.tipo === TipoItemEnum.PASTA && b.tipo !== TipoItemEnum.PASTA)
        return -1;
      if (a.tipo !== TipoItemEnum.PASTA && b.tipo === TipoItemEnum.PASTA)
        return 1;
      return 0;
    });
  }

  return result;
});

function handleAiGenerationByTopic(regras: any[]) {
  showGenerateAiDialog.value = false;

  for (const data of regras) {
    const payload = {
      assunto: data.assunto,
      dificuldade: data.dificuldade,
      quantidade: data.quantidade,
      tipoQuestao: data.tipo,
    };

    questionBankStore.startGenerationStream(payload);
  }
}

defineExpose({
  selectedItems,
});
</script>

<template>
  <div>
    <CreateFolderDialog
      v-model="showCreateFolder"
      :current-path-label="currentPathLabel"
      @create="handleCreateFolder"
    />

    <CreateQuestionDialog
      v-model="showCreateQuestion"
      @create="handleCreateQuestion"
    />

    <GenerateQuestionsIaDialog
      v-model="showGenerateAiDialog"
      :materiais-anexados="[]"
      :is-loading="questionBankStore.isGenerating"
      @generate-by-topic="handleAiGenerationByTopic"
      @generate="handleAiGeneration"
      @open-materials-bank="handleOpenMaterialsBank"
    />

    <OpenMaterialsBankDialog
      v-model="showMaterialsBankDialog"
      @add-materials="handleMaterialsSelection"
    />

    <template v-if="editingItem">
      <EditFolderDialog
        v-if="isFolder(editingItem)"
        :model-value="true"
        :folder="editingItem"
        @update:model-value="editingItem = null"
        @update="handleUpdate"
      />
      <EditQuestionDialog
        v-else
        :model-value="true"
        :question="editingItem"
        @update:model-value="editingItem = null"
        @update="handleUpdate"
      />
    </template>

    <div class="flex justify-end mb-8">
      <div class="mt-4 sm:mt-0 flex gap-3">
        <UButton icon="i-lucide-folder-plus" @click="showCreateFolder = true">
          Nova pasta
        </UButton>
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-brain-circuit"
          @click="showGenerateAiDialog = true"
        >
          Gerar com I.A.
        </UButton>
        <UButton
          color="secondary"
          icon="i-lucide-plus"
          @click="showCreateQuestion = true"
        >
          Nova questão
        </UButton>
      </div>
    </div>

    <Breadcrumbs :items="breadcrumbItems" />

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex gap-4 w-full">
        <UFormField label="Buscar" class="w-full">
          <UInput
            v-model="filters.search"
            placeholder="Buscar por título"
            icon="i-lucide-search"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tipo de questão" class="w-full">
          <USelect v-model="filters.type" :items="typeOptions" class="w-full" />
        </UFormField>
        <UFormField label="Dificuldade" class="w-full md:w-auto md:flex-1">
          <USelect
            v-model="filters.difficulty"
            :items="difficultyOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ordenar por" class="w-full">
          <USelect v-model="filters.sort" :items="sortOptions" class="w-full" />
        </UFormField>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="filteredItems.length === 0"
        class="text-center text-gray-500 py-10"
      >
        <span v-if="questionBankStore.isLoading">Carregando...</span>
        <span v-else>Nenhum item encontrado nesta pasta.</span>
      </div>

      <template v-if="questionBankStore.pendingGenerations > 0">
        <div
          v-for="i in questionBankStore.pendingGenerations"
          :key="`skeleton-${i}`"
          class="border border-gray-200 rounded-lg p-4 bg-white animate-pulse flex items-start gap-4"
        >
          <div class="w-10 h-10 bg-gray-200 rounded-lg" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-3 bg-gray-200 rounded w-1/2" />
            <div class="flex gap-2 mt-2">
              <div class="h-5 w-16 bg-gray-200 rounded-full" />
              <div class="h-5 w-24 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div
            class="text-xs text-gray-400 font-medium flex items-center gap-1"
          >
            <Icon name="i-lucide-sparkles" class="animate-spin" />
            Gerando I.A...
          </div>
        </div>
      </template>

      <div
        v-for="item in filteredItems"
        v-else
        :key="item.id"
        @click.prevent="handleItemClick(item)"
      >
        <QuestionsBankFolderItem
          v-if="isFolder(item)"
          :item="item"
          :selectable="mode === 'select'"
          :child-count="item.childCount || 0"
          :is-selected="selectedItems.folders.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
        <QuestionsBankQuestionItem
          v-else
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.questions.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
      </div>
    </div>
  </div>
</template>
