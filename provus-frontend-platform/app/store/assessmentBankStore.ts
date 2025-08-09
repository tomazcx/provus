import isFolder from "~/guards/isFolder";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type { IFolder } from "~/types/IBank";

type TExamBankItem = IFolder | IAvaliacaoImpl;

export const useExamBankStore = defineStore("examBank", () => {
  const items = ref<TExamBankItem[]>([]);
  const isLoading = ref(false);

  async function fetchItems() {
    if (items.value.length > 0) return;
    isLoading.value = true;
    try {
      const { mockExamBankResponse } = await import(
        "~/mock/mockExamBankResponse"
      );

      items.value = mockExamBankResponse;
    } catch (error) {
      console.error("Erro ao buscar itens do banco de avaliações:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function getItemById(id: number) {
    const item = items.value.find((item) => !isFolder(item) && item.id === id);
    return item as IAvaliacaoImpl | undefined;
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

  async function createModelo(data: {
    modeloData: IAvaliacaoImpl;
    path: string;
  }): Promise<IAvaliacaoImpl> {
    const newModelo: IAvaliacaoImpl = {
      ...data.modeloData,
      id: Date.now(),
      path: data.path,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    items.value.push(newModelo);

    return newModelo;
  }

  async function deleteItem(itemToDelete: TExamBankItem) {
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
    item: TExamBankItem;
    newTitle?: string;
    updatedData?: Partial<IAvaliacaoImpl>;
  }): Promise<TExamBankItem | undefined> {
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

      return items.value.find((i) => i.id === item.id);
    } else if (!isFolder(item) && updatedData) {
      const index = items.value.findIndex((f) => f.id === item.id);
      if (index !== -1) {
        const current = items.value[index] as IAvaliacaoImpl;
        items.value[index] = {
          ...current,
          ...updatedData,
          titulo: updatedData.titulo ?? current.titulo,
          pontuacao: updatedData.pontuacao ?? current.pontuacao,
          descricao: updatedData.descricao ?? current.descricao,
          isModelo: updatedData.isModelo ?? current.isModelo,
          questoes: updatedData.questoes ?? current.questoes,
          configuracoes: updatedData.configuracoes ?? current.configuracoes,
          atualizadoEm: new Date().toISOString(),
        };

        return items.value[index]; 
      }
    }
  }

  const getItemsByPath = (path: string) => {
    return items.value.filter((item) => item.path === path);
  };

  return {
    items,
    isLoading,
    getItemById,
    fetchItems,
    createFolder,
    createModelo,
    deleteItem,
    updateItem,
    getItemsByPath,
  };
});
