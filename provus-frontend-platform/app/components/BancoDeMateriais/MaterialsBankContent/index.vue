<script setup lang="ts">
import MaterialsBankFolderItem from "~/components/BancoDeMateriais/MaterialsBankFolderItem/index.vue";
import CreateFileDialog from "@/components/BancoDeMateriais/CreateFileDialog/index.vue";
import EditFileDialog from "@/components/BancoDeMateriais/EditFileDialog/index.vue";
import MaterialsBankFileItem from "@/components/BancoDeMateriais/MaterialsBankFileItem/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";

import isFolder from "~/guards/isFolder";
import { useMaterialsBankStore } from "~/store/materialsBankStore";
import type { IFolder } from "~/types/IBank";
import type { IFile } from "~/types/IFile";

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});
const emit = defineEmits(["path-changed"]);

const materialsBankStore = useMaterialsBankStore();
const showCreateFolder = ref(false);
const showCreateFile = ref(false);
const editingFile = ref<IFile | null>(null);
const editingFolder = ref<IFolder | null>(null);
const internalCurrentPath = ref("/");
const selectedItems = ref({
  folders: new Set<number>(),
  files: new Set<number>(),
});
const filters = reactive({
  search: "",
  type: "Todos os tipos",
  sort: "Última modificação",
});

onMounted(() => {
  materialsBankStore.fetchItems();
});

function handleItemClick(item: IFolder | IFile) {
  if (isFolder(item)) {
    const newPath =
      internalCurrentPath.value === "/"
        ? `/${item.titulo}`
        : `${internalCurrentPath.value}/${item.titulo}`;
    internalCurrentPath.value = newPath;
  } else {
    if (props.mode === "select") {
      handleSelectItem(item);
    } else {
      window.open(item.url, "_blank");
    }
  }
}

function handleSelectItem(item: IFolder | IFile) {
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.files;
  const isSelected = targetSet.has(item.id!);

  if (isSelected) {
    targetSet.delete(item.id!);
  } else {
    targetSet.add(item.id!);
  }
}

watch(internalCurrentPath, (newPath) => {
  emit("path-changed", newPath);
});

function handleCreateFolder(data: { titulo: string }) {
  materialsBankStore.createFolder({
    titulo: data.titulo,
    path: internalCurrentPath.value,
  });
  showCreateFolder.value = false;
}

function handleCreateFile(data: {
  formData: Omit<IFile, "id" | "path" | "criadoEm" | "atualizadoEm">;
}) {
  materialsBankStore.createFile({
    formData: data.formData,
    path: internalCurrentPath.value,
  });
  showCreateFile.value = false;
}

function handleUpdateFolder({ newTitle }: { newTitle: string }) {
  if (!editingFolder.value) return;
  materialsBankStore.updateItem({ item: editingFolder.value, newTitle });
  editingFolder.value = null;
}

function handleUpdateFile(updatedData: Partial<IFile>) {
  if (!editingFile.value) return;
  materialsBankStore.updateItem({ item: editingFile.value, updatedData });
  editingFile.value = null;
}

function handleDelete(itemToDelete: IFolder | IFile) {
  materialsBankStore.deleteItem(itemToDelete);
}

function handleEdit(item: IFolder | IFile) {
  if (isFolder(item)) {
    editingFolder.value = item;
  } else {
    editingFile.value = item;
  }
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
  const crumbs = [{ label: "Banco de Materiais", to: "/banco-de-materiais" }];
  const currentCrumbPath: string[] = [];
  for (const segment of pathSegments.value) {
    currentCrumbPath.push(segment);
    crumbs.push({
      label: segment,
      to: `/banco-de-materiais/${currentCrumbPath.join("/")}`,
    });
  }
  return crumbs;
});

const currentPathLabel = computed(() => {
  return breadcrumbs.value.map((crumb) => crumb.label).join(" > ");
});

const itemsInCurrentFolder = computed(() =>
  materialsBankStore.items
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
  return materialsBankStore.items.filter((item) => item.path === childPath)
    .length;
}

function navigateFromBreadcrumb(path: string) {
  if (path === "/banco-de-materiais") {
    internalCurrentPath.value = "/";
  } else {
    internalCurrentPath.value = path.replace("/banco-de-materiais", "");
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
    <CreateFileDialog v-model="showCreateFile" @create="handleCreateFile" />
    <EditFileDialog
      :model-value="!!editingFile"
      :file="editingFile"
      @update:model-value="editingFile = null"
      @update:file="handleUpdateFile"
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
          @click="showCreateFile = true"
        >
          Novo arquivo
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
        <UFormField label="Tipo de arquivo" class="w-full">
          <USelect
            v-model="filters.type"
            :items="[
              'Todos os tipos',
              'PDF',
              'Documento Word',
              'Apresentação',
              'Texto',
              'Outro',
            ]"
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
        :class="{
          'cursor-pointer hover:bg-gray-50':
            isFolder(item) || mode === 'select',
          'cursor-pointer hover:bg-blue-50/50':
            !isFolder(item) && mode === 'browse',
        }"
        @click.prevent="handleItemClick(item)"
      >
        <MaterialsBankFolderItem
          v-if="isFolder(item)"
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          :child-count="getChildCount(item)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
        <MaterialsBankFileItem
          v-else
          :item="item"
          :is-selected="selectedItems.files.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
      </div>
    </div>
  </div>
</template>
