import { defineStore } from "pinia";
import isFolder from "~/guards/isFolder";
import type { IFolder } from "~/types/IBank";
import type { IFile } from "~/types/IFile";

type TMaterialBankItem = IFolder | IFile;

export const useMaterialsBankStore = defineStore("materialsBank", () => {
  const items = ref<TMaterialBankItem[]>([]);
  const isLoading = ref(false);

  async function fetchItems() {
    if (items.value.length > 0) return;

    isLoading.value = true;
    try {
      items.value = [];
    } catch (error) {
      console.error("Erro ao buscar itens do banco de materiais:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function createFolder(newFolderData: { titulo: string; path: string }) {
    const createdFolder: IFolder = {
      id: Date.now(),
      ...newFolderData,
      filhos: [],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    items.value.push(createdFolder);
  }

  async function createFile(data: {
    formData: Omit<IFile, "id" | "path" | "criadoEm" | "atualizadoEm">;
    path: string;
  }) {
    const newFile: IFile = {
      id: Date.now(),
      ...data.formData,
      path: data.path,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    items.value.push(newFile);
  }

  async function deleteItem(itemToDelete: TMaterialBankItem) {
    if (!isFolder(itemToDelete)) {
      const index = items.value.findIndex(
        (item) => item.id === itemToDelete.id
      );
      if (index !== -1) items.value.splice(index, 1);
    } else {
      const pathPrefix =
        itemToDelete.path === "/"
          ? `/${itemToDelete.titulo}`
          : `${itemToDelete.path}/${itemToDelete.titulo}`;
      items.value = items.value.filter((item) => {
        const shouldDelete =
          item.id === itemToDelete.id ||
          (item.path && item.path.startsWith(pathPrefix));
        return !shouldDelete;
      });
    }
  }

  async function updateItem(payload: {
    item: TMaterialBankItem;
    newTitle?: string;
    updatedData?: Partial<IFile>;
  }) {
    const { item, newTitle, updatedData } = payload;

    if (isFolder(item) && newTitle) {
      const oldTitle = item.titulo;
      const oldChildPath =
        item.path === "/" ? `/${oldTitle}` : `${item.path}/${oldTitle}`;
      const newChildPath =
        item.path === "/" ? `/${newTitle}` : `${item.path}/${newTitle}`;

      const folderInArray = items.value.find((i) => i.id === item.id) as
        | IFolder
        | undefined;
      if (folderInArray) {
        folderInArray.titulo = newTitle;
        folderInArray.atualizadoEm = new Date().toISOString();
      }

      items.value.forEach((i) => {
        if (i.path && i.path.startsWith(oldChildPath)) {
          i.path = i.path.replace(oldChildPath, newChildPath);
        }
      });
    } else if (!isFolder(item) && updatedData) {
      const index = items.value.findIndex((f) => f.id === item.id);
      if (index !== -1) {
        const currentFile = items.value[index] as IFile;
        items.value[index] = {
          ...currentFile,
          ...updatedData,
          tipo: updatedData.tipo ?? currentFile.tipo,
          url: updatedData.url ?? currentFile.url,
          titulo: updatedData.titulo ?? currentFile.titulo,
          path: updatedData.path ?? currentFile.path,
          criadoEm: currentFile.criadoEm,
          atualizadoEm: new Date().toISOString(),
        };
      }
    }
  }

  const getItemsByPath = (path: string) => {
    return items.value.filter((item) => item.path === path);
  };

  return {
    items,
    isLoading,
    fetchItems,
    createFolder,
    createFile,
    deleteItem,
    updateItem,
    getItemsByPath,
  };
});
