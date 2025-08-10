<script setup lang="ts">
import ExamBankItem from "~/components/BancoDeAvaliacoes/ExamBankItem/index.vue";
import ExamBankFolder from "~/components/BancoDeAvaliacoes/ExamBankFolder/index.vue";

import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";

import isFolder from "~/guards/isFolder";
import type { IFolder } from "~/types/IBank";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import { useExamBankStore } from "~/store/assessmentBankStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { IAplicacao } from "~/types/IAplicacao";

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});

defineEmits(["path-changed"]);

const examBankStore = useExamBankStore();
const applicationsStore = useApplicationsStore();
const router = useRouter();
const showCreateFolder = ref(false);
const editingFolder = ref<IFolder | null>(null);
const internalCurrentPath = ref("/");
const selectedItems = ref({
  folders: new Set<number>(),
  exams: new Set<number>(),
});

const applicationToStart = ref<IAplicacao | null>(null);
const isDialogVisible = computed({
  get: () => !!applicationToStart.value,
  set: (value) => {
    if (!value) {
      applicationToStart.value = null;
    }
  },
});

const filters = reactive({
  search: "",
  sort: "Última modificação",
});

onMounted(() => {
  examBankStore.fetchItems();
});

function handleItemClick(item: IFolder | IAvaliacaoImpl) {
  if (isFolder(item)) {
    const newPath =
      internalCurrentPath.value === "/"
        ? `/${item.titulo}`
        : `${internalCurrentPath.value}/${item.titulo}`;
    internalCurrentPath.value = newPath;
  } else if (props.mode === "select" && item.id) {
    handleSelectItem(item);
  } else {
    router.push(`/avaliacao/editor/${item.id}`);
  }
}

function handleSelectItem(item: IFolder | IAvaliacaoImpl) {
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.exams;
  const isSelected = targetSet.has(item.id!);

  if (isSelected) {
    targetSet.delete(item.id!);
  } else {
    targetSet.add(item.id!);
  }
}

function handleCreateModelo() {
  router.push(`/avaliacao/editor?path=${internalCurrentPath.value}`);
}

function handleApply(item: IAvaliacaoImpl) {
  const newApp = applicationsStore.createApplication(item);
  applicationToStart.value = newApp;
}

function handleStartNow() {
  if (applicationToStart.value) {
    applicationsStore.startApplication(applicationToStart.value.id);
    applicationToStart.value = null;
    const firstApp = applicationsStore.applications[0];
    if (firstApp) {
      router.push(`/aplicacoes/aplicacao/${firstApp.id}/monitoramento`);
    }
  }
}

function handleEdit(item: IFolder | IAvaliacaoImpl) {
  if (isFolder(item)) {
    editingFolder.value = item;
  } else {
    router.push(`/avaliacao/editor/${item.id}`);
  }
}

function handleCreateFolder(data: { titulo: string }) {
  examBankStore.createFolder({
    titulo: data.titulo,
    path: internalCurrentPath.value,
  });
  showCreateFolder.value = false;
}

function handleUpdateFolder({ newTitle }: { newTitle: string }) {
  if (!editingFolder.value) return;
  examBankStore.updateItem({ item: editingFolder.value, newTitle });
  editingFolder.value = null;
}

function handleDelete(itemToDelete: IFolder | IAvaliacaoImpl) {
  examBankStore.deleteItem(itemToDelete);
}

const pathSegments = computed(() => {
  if (internalCurrentPath.value === "/") return [];
  return internalCurrentPath.value.substring(1).split("/");
});

const currentPath = computed(() => {
  if (pathSegments.value.length === 0) return "/";
  return `/${pathSegments.value.join("/")}`;
});

const breadcrumbs = computed(() => {
  const crumbs = [{ label: "Banco de Avaliações", to: "/banco-de-avaliacoes" }];
  const currentCrumbPath: string[] = [];
  for (const segment of pathSegments.value) {
    currentCrumbPath.push(segment);
    crumbs.push({
      label: segment,
      to: `/banco-de-avaliacoes/${currentCrumbPath.join("/")}`,
    });
  }
  return crumbs;
});

const itemsInCurrentFolder = computed(() =>
  examBankStore.items
    .filter((item) => isFolder(item) || item.isModelo === true)
    .filter((item) => item.path === currentPath.value)
    .sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      const dateA = new Date(a.atualizadoEm ?? 0).getTime();
      const dateB = new Date(b.atualizadoEm ?? 0).getTime();
      return dateB - dateA;
    })
);

function getChildCount(folder: IFolder): number {
  const childPath =
    folder.path === "/"
      ? `/${folder.titulo}`
      : `${folder.path}/${folder.titulo}`;
  return examBankStore.items.filter((item) => item.path === childPath).length;
}

function navigateFromBreadcrumb(path: string) {
  if (path === "/banco-de-avaliacoes") {
    internalCurrentPath.value = "/";
  } else {
    internalCurrentPath.value = path.replace("/banco-de-avaliacoes", "");
  }
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
      :current-path-label="breadcrumbs.map((c) => c.label).join(' > ')"
      @create="handleCreateFolder"
    />
    <EditFolderDialog
      :model-value="!!editingFolder"
      :folder="editingFolder"
      @update:model-value="editingFolder = null"
      @update="handleUpdateFolder"
    />

    <div class="flex justify-end mb-8">
      <div class="mt-4 sm:mt-0 space-x-3">
        <UButton icon="i-lucide-folder-plus" @click="showCreateFolder = true">
          Nova pasta
        </UButton>
        <UButton
          color="secondary"
          icon="i-lucide-plus"
          @click="handleCreateModelo"
        >
          Novo modelo de avaliação
        </UButton>
      </div>
    </div>

    <div v-if="pathSegments.length > 0" class="mb-6">
      <UBreadcrumb :items="breadcrumbs">
        <template #item="{ item }">
          <span
            class="cursor-pointer hover:underline"
            @click.prevent="navigateFromBreadcrumb(item.to)"
          >
            {{ item.label }}
          </span>
        </template>
      </UBreadcrumb>
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
          <USelect
            v-model="filters.sort"
            :items="[
              'Última modificação',
              'Ordem alfabética A-Z',
              'Ordem alfabética Z-A',
            ]"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="itemsInCurrentFolder.length === 0"
        class="text-center text-gray-500 py-10"
      >
        Esta pasta está vazia.
      </div>
      <div
        v-for="item in itemsInCurrentFolder"
        v-else
        :key="item.id"
        class="cursor-pointer"
        @click.prevent="handleItemClick(item)"
      >
        <ExamBankFolder
          v-if="isFolder(item)"
          :item="item"
          :child-count="getChildCount(item)"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
        <ExamBankItem
          v-else
          :item="item"
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
