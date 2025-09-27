<script setup lang="ts">
import MaterialsBankFolderItem from "~/components/BancoDeMateriais/MaterialsBankFolderItem/index.vue";
import CreateFileDialog from "@/components/BancoDeMateriais/CreateFileDialog/index.vue";
import EditFileDialog from "@/components/BancoDeMateriais/EditFileDialog/index.vue";
import MaterialsBankFileItem from "@/components/BancoDeMateriais/MaterialsBankFileItem/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";

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
  type: "Todos os tipos",
  sort: "Última modificação",
});

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
    index: index,
  }))
);

const currentPathLabel = computed(() =>
  materialsBankStore.breadcrumbs.map((c) => c.titulo).join(" > ")
);

const filteredItems = computed(() =>
  materialsBankStore.items.filter((item) =>
    item.titulo.toLowerCase().includes(filters.search.toLowerCase())
  )
);

function getChildCount(folder: FolderEntity): number {
  return materialsBankStore.items.filter((item) => item.paiId === folder.id)
    .length;
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

    <div v-if="materialsBankStore.breadcrumbs.length > 0" class="mb-6">
      <UBreadcrumb :links="breadcrumbItems">
        <template #item="{ item, index }">
          <span
            class="cursor-pointer hover:underline"
            @click.prevent="materialsBankStore.navigateToBreadcrumb(index)"
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
        v-if="filteredItems.length === 0"
        class="text-center text-gray-500 py-10"
      >
        <span v-if="materialsBankStore.isLoading">Carregando...</span>
        <span v-else>Esta pasta está vazia.</span>
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
          :child-count="getChildCount(item)"
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
