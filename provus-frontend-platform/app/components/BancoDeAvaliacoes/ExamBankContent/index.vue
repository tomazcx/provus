<script setup lang="ts">
import ExamBankItem from "~/components/BancoDeAvaliacoes/ExamBankItem/index.vue";
import ExamBankFolder from "~/components/BancoDeAvaliacoes/ExamBankFolder/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";
import StartApplicationDialog from "@/components/Aplicacoes/StartApplicationDialog/index.vue";
import { useExamBankStore } from "~/store/assessmentBankStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { UpdateAvaliacaoRequest } from "~/types/api/request/Avaliacao.request";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoItemEnum from "~/enums/TipoItemEnum";

function isFolder(item: AvaliacaoEntity | FolderEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});

const examBankStore = useExamBankStore();
const applicationsStore = useApplicationsStore();
const router = useRouter();

const showCreateFolder = ref(false);
const editingItem = ref<AvaliacaoEntity | FolderEntity | null>(null);
const selectedItems = ref({
  folders: new Set<number>(),
  exams: new Set<number>(),
});

const applicationToStart = ref<AplicacaoEntity | null>(null);
const isDialogVisible = computed({
  get: () => !!applicationToStart.value,
  set: (value) => {
    if (!value) applicationToStart.value = null;
  },
});

const filters = reactive({
  search: "",
  sort: "Última modificação",
});

const sortOptions = [
  "Última modificação",
  "Mais Recente",
  "Mais Antigo",
  "Ordem alfabética A-Z",
  "Ordem alfabética Z-A",
];

onMounted(() => {
  examBankStore.initialize();
});

const breadcrumbs = computed(() =>
  examBankStore.breadcrumbs.map((crumb, index) => ({
    label: crumb.titulo,
    index,
  }))
);

const currentPathLabel = computed(() =>
  examBankStore.breadcrumbs.map((c) => c.titulo).join(" > ")
);

const filteredItems = computed(() => {
  let result = [...examBankStore.items];

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.toLowerCase();
    result = result.filter((item) => item.titulo.toLowerCase().includes(term));
  }

  result.sort((a, b) => {
    const typeA = isFolder(a) ? 0 : 1;
    const typeB = isFolder(b) ? 0 : 1;
    if (typeA !== typeB) {
      return typeA - typeB;
    }

    const dateUpdatedA = new Date(a.atualizadoEm).getTime();
    const dateUpdatedB = new Date(b.atualizadoEm).getTime();
    const dateCreatedA = new Date(a.criadoEm).getTime();
    const dateCreatedB = new Date(b.criadoEm).getTime();

    switch (filters.sort) {
      case "Última modificação":
        return dateUpdatedB - dateUpdatedA;
      case "Mais Recente":
        return dateCreatedB - dateCreatedA;
      case "Mais Antigo":
        return dateCreatedA - dateCreatedB;
      case "Ordem alfabética A-Z":
        return a.titulo.localeCompare(b.titulo);
      case "Ordem alfabética Z-A":
        return b.titulo.localeCompare(a.titulo);
      default:
        return 0;
    }
  });

  return result;
});

function handleItemClick(item: AvaliacaoEntity | FolderEntity) {
  if (isFolder(item)) {
    examBankStore.navigateToFolder(item);
  } else if (props.mode === "select" && item.id) {
    handleSelectItem(item);
  } else {
    router.push(`/avaliacao/editor/${item.id}`);
  }
}

function handleSelectItem(item: AvaliacaoEntity | FolderEntity) {
  if (!item.id) return;
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.exams;

  if (targetSet.has(item.id)) {
    targetSet.delete(item.id);
  } else {
    targetSet.add(item.id);
  }
}

function handleCreateModelo() {
  router.push(`/avaliacao/editor?paiId=${examBankStore.currentFolderId || ""}`);
}

async function handleApply(item: AvaliacaoEntity) {
  const newApp = await applicationsStore.createApplication(item);
  if (newApp) {
    applicationToStart.value = newApp;
  }
}

async function handleStartNow() {
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

function handleEdit(item: AvaliacaoEntity | FolderEntity) {
  if (isFolder(item)) {
    editingItem.value = item;
  } else {
    router.push(`/avaliacao/editor/${item.id}`);
  }
}

function handleCreateFolder(data: { titulo: string }) {
  examBankStore.createFolder(data);
  showCreateFolder.value = false;
}

function handleUpdate(
  updatedData: { newTitle: string } | UpdateAvaliacaoRequest
) {
  if (!editingItem.value) return;
  const dataToSend =
    "newTitle" in updatedData ? { titulo: updatedData.newTitle } : updatedData;
  examBankStore.updateItem(editingItem.value, dataToSend);
  editingItem.value = null;
}

function handleDelete(itemToDelete: AvaliacaoEntity | FolderEntity) {
  examBankStore.deleteItem(itemToDelete);
}
</script>

<template>
  <div>
    <StartApplicationDialog
      v-model="isDialogVisible"
      :aplicacao="applicationToStart"
      @start-now="handleStartNow"
    />
    <CreateFolderDialog
      v-model="showCreateFolder"
      :current-path-label="currentPathLabel"
      @create="handleCreateFolder"
    />

    <EditFolderDialog
      v-if="editingItem && isFolder(editingItem)"
      :model-value="!!editingItem"
      :folder="editingItem as FolderEntity"
      @update:model-value="editingItem = null"
      @update="handleUpdate"
    />

    <div class="flex justify-end mb-8">
      <div class="mt-4 sm:mt-0 space-x-3">
        <UButton icon="i-lucide-folder-plus" @click="showCreateFolder = true"
          >Nova pasta</UButton
        >
        <UButton
          color="secondary"
          icon="i-lucide-plus"
          @click="handleCreateModelo"
          >Novo modelo de avaliação</UButton
        >
      </div>
    </div>

    <div v-if="examBankStore.breadcrumbs.length > 1" class="mb-6">
      <UBreadcrumb
        :links="
          breadcrumbs.map((b) => ({
            label: b.label,
            click: () => examBankStore.navigateToBreadcrumb(b.index),
          }))
        "
      />
    </div>

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
        <UFormField label="Ordenar por" class="w-full">
          <USelect v-model="filters.sort" :items="sortOptions" class="w-full" />
        </UFormField>
      </div>
    </div>

    <div v-if="examBankStore.isLoading" class="text-center text-gray-500 py-10">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-8 w-8 text-primary"
      />
      <p class="mt-2">Carregando...</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-if="filteredItems.length === 0"
        class="text-center text-gray-500 py-10"
      >
        <span v-if="filters.search"
          >Nenhum item encontrado para "{{ filters.search }}".</span
        >
        <span v-else>Esta pasta está vazia.</span>
      </div>

      <div
        v-for="item in filteredItems"
        v-else
        :key="item.id"
        class="cursor-pointer"
        @click.prevent="handleItemClick(item)"
      >
        <ExamBankFolder
          v-if="isFolder(item)"
          :item="item"
          :child-count="item.childCount || 0"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
        <ExamBankItem
          v-else
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.exams.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
          @apply="handleApply(item)"
        />
      </div>
    </div>
  </div>
</template>
