<script setup lang="ts">
import MaterialsBankFolderItem from "~/components/BancoDeMateriais/MaterialsBankFolderItem/index.vue";
import CreateFileDialog from "@/components/BancoDeMateriais/CreateFileDialog/index.vue";
import EditFileDialog from "@/components/BancoDeMateriais/EditFileDialog/index.vue";
import MaterialsBankFileItem from "@/components/BancoDeMateriais/MaterialsBankFileItem/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import { useMaterialsBankStore } from "~/store/materialsBankStore";
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { UpdateArquivoRequest } from "~/types/api/request/Arquivo.request";
import TipoItemEnum from "~/enums/TipoItemEnum";

function isFolder(item: ArquivoEntity | FolderEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});

const materialsBankStore = useMaterialsBankStore();
const showCreateFolder = ref(false);
const showCreateFile = ref(false);
const editingItem = ref<ArquivoEntity | FolderEntity | null>(null);
const selectedItems = ref({
  folders: new Set<number>(),
  files: new Set<number>(),
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
  materialsBankStore.initialize();
});

function handleItemClick(item: ArquivoEntity | FolderEntity) {
  if (isFolder(item)) {
    materialsBankStore.navigateToFolder(item);
  } else {
    if (props.mode === "select") {
      handleSelectItem(item);
    } else {
      window.open(item.url, "_blank");
    }
  }
}

function handleSelectItem(item: ArquivoEntity | FolderEntity) {
  if (!item.id) return;
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.files;

  if (targetSet.has(item.id)) {
    targetSet.delete(item.id);
  } else {
    targetSet.add(item.id);
  }
}

function handleCreateFolder(data: { titulo: string }) {
  materialsBankStore.createFolder(data);
  showCreateFolder.value = false;
}

function handleCreateFile(formData: FormData) {
  materialsBankStore.createFile(formData);
  showCreateFile.value = false;
}

function handleUpdate(
  updatedData: { newTitle: string } | UpdateArquivoRequest
) {
  if (!editingItem.value) return;
  const dataToSend =
    "newTitle" in updatedData ? { titulo: updatedData.newTitle } : updatedData;
  materialsBankStore.updateItem(editingItem.value, dataToSend);
  editingItem.value = null;
}

function handleDelete(itemToDelete: ArquivoEntity | FolderEntity) {
  materialsBankStore.deleteItem(itemToDelete);
}

const breadcrumbItems = computed(() =>
  materialsBankStore.breadcrumbs.map((crumb, index) => ({
    label: crumb.titulo,
    click: () => materialsBankStore.navigateToBreadcrumb(index),
    disabled: index === materialsBankStore.breadcrumbs.length - 1,
    class:
      index !== materialsBankStore.breadcrumbs.length - 1
        ? "cursor-pointer hover:text-primary"
        : "",
  }))
);

const currentPathLabel = computed(() =>
  materialsBankStore.breadcrumbs.map((c) => c.titulo).join(" > ")
);

const filteredItems = computed(() => {
  let result = [...materialsBankStore.items];

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

    <template v-if="editingItem">
      <EditFolderDialog
        v-if="isFolder(editingItem)"
        :model-value="true"
        :folder="editingItem"
        @update:model-value="editingItem = null"
        @update="handleUpdate"
      />
      <EditFileDialog
        v-else
        :model-value="true"
        :file="editingItem"
        @update:model-value="editingItem = null"
        @update:file="handleUpdate"
      />
    </template>

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
        <span v-if="materialsBankStore.isLoading">Carregando...</span>
        <span v-else>
          <span v-if="filters.search"
            >Nenhum item encontrado para "{{ filters.search }}".</span
          >
          <span v-else>Esta pasta está vazia.</span>
        </span>
      </div>

      <div
        v-for="item in filteredItems"
        v-else
        :key="item.id"
        @click.prevent="handleItemClick(item)"
      >
        <MaterialsBankFolderItem
          v-if="isFolder(item)"
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          :child-count="item.childCount || 0"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
        <MaterialsBankFileItem
          v-else
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.files.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
      </div>
    </div>
  </div>
</template>
