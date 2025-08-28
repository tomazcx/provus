/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineStore } from "pinia";
import TipoItemEnum from "~/enums/TipoItemEnum";
import isFolder from "~/guards/isFolder";
import type { TBankItem, IFolderListItem } from "~/types/IBank";
import type { IQuestao, TQuestionForm } from "~/types/IQuestao";

interface Breadcrumb {
  id: number;
  titulo: string;
}

interface BancoMetadados {
  tipoBanco: string;
  titulo: string;
  pastaId: number;
}

export const useQuestionBankStore = defineStore("questionBank", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const items = ref<TBankItem[]>([]);
  const breadcrumbs = ref<Breadcrumb[]>([]);
  const isLoading = ref(false);
  const rootFolderId = ref<number | null>(null);
  const isInitialized = ref(false);

  const currentFolderId = computed(() => {
    if (breadcrumbs.value.length === 0) return null;
    return breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? null;
  });

  async function fetchFolderContent(folderId: number) {
    isLoading.value = true;
    try {
      let endpoint = "";
      if (folderId === rootFolderId.value) {
        endpoint = "/backoffice/bancos-de-conteudo/QUESTOES/conteudo";
      } else {
        endpoint = `/backoffice/pastas/${folderId}/conteudo`;
      }

      items.value = await $api<TBankItem[]>(endpoint);
    } catch (error) {
      toast.add({ title: "Erro ao buscar itens", color: "error" });
      console.error("Erro ao buscar itens do banco de questões:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function initialize() {
    if (isInitialized.value) {
      return;
    }

    try {
      isLoading.value = true;

      const bancos = await $api<BancoMetadados[]>(
        "/backoffice/bancos-de-conteudo"
      );
      const bancoDeQuestoes = bancos.find((b) => b.tipoBanco === "QUESTOES");

      if (!bancoDeQuestoes) {
        throw new Error("Banco de Questões não encontrado para este usuário.");
      }

      const idDaRaiz = bancoDeQuestoes.pastaId;
      rootFolderId.value = idDaRaiz;

      breadcrumbs.value = [{ id: idDaRaiz, titulo: bancoDeQuestoes.titulo }];

      await fetchFolderContent(idDaRaiz);

      isInitialized.value = true;
    } catch (error) {
      toast.add({
        title: "Erro ao inicializar o banco de questões",
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function navigateToFolder(folder: IFolderListItem) {
    breadcrumbs.value.push({ id: folder.id, titulo: folder.titulo });
    await fetchFolderContent(folder.id);
  }

  async function navigateToBreadcrumb(breadcrumbIndex: number) {
    const targetCrumb = breadcrumbs.value[breadcrumbIndex];

    if (!targetCrumb) {
      console.error("Índice de breadcrumb inválido:", breadcrumbIndex);
      return;
    }

    const targetFolderId = targetCrumb.id;
    breadcrumbs.value = breadcrumbs.value.slice(0, breadcrumbIndex + 1);
    await fetchFolderContent(targetFolderId);
  }

  async function createFolder(newFolderData: { titulo: string }) {
    try {
      await $api("/backoffice/item-sistema-arquivos", {
        method: "POST",
        body: {
          titulo: newFolderData.titulo,
          paiId: currentFolderId.value,
          tipo: TipoItemEnum.PASTA,
        },
      });
      toast.add({ title: "Pasta criada com sucesso!", color: "secondary" });
      const folderToRefresh = currentFolderId.value;
      if (folderToRefresh !== null) {
        await fetchFolderContent(folderToRefresh);
      }
    } catch (error) {
      toast.add({ title: "Erro ao criar pasta", color: "error" });
    }
  }

  async function createQuestion(formData: TQuestionForm) {
    try {
      const questaoPayload = {
        ...formData,
        paiId: currentFolderId.value,
      };

      await $api("/backoffice/questao/nova", {
        method: "POST",
        body: questaoPayload,
      });

      toast.add({ title: "Questão criada com sucesso!", color: "secondary" });
      const folderToRefresh = currentFolderId.value;
      if (folderToRefresh !== null) {
        await fetchFolderContent(folderToRefresh);
      }
    } catch (error) {
      toast.add({ title: "Erro ao criar questão", color: "error" });
    }
  }

  async function deleteItem(itemToDelete: TBankItem) {
    try {
      await $api(`/backoffice/item-sistema-arquivos/${itemToDelete.id}`, {
        method: "DELETE",
      });
      toast.add({ title: "Item deletado com sucesso!", color: "secondary" });
      const folderToRefresh = currentFolderId.value;
      if (folderToRefresh !== null) {
        await fetchFolderContent(folderToRefresh);
      }
    } catch (error) {
      toast.add({ title: "Erro ao deletar item", color: "error" });
    }
  }

  async function updateItem(
    itemToUpdate: TBankItem,
    updatedData: Partial<TQuestionForm> | { titulo: string }
  ) {
    try {
      let endpoint = "";
      if (isFolder(itemToUpdate)) {
        endpoint = `/backoffice/item-sistema-arquivos/${itemToUpdate.id}`;
      } else {
        endpoint = `/backoffice/questao/${itemToUpdate.id}`;
      }

      await $api(endpoint, {
        method: "PATCH",
        body: updatedData,
      });

      toast.add({ title: "Item atualizado com sucesso!", color: "secondary" });
      const folderToRefresh = currentFolderId.value;
      if (folderToRefresh !== null) {
        await fetchFolderContent(folderToRefresh);
      }
    } catch (error) {
      toast.add({ title: "Erro ao atualizar item", color: "error" });
    }
  }

  async function fetchAllQuestionIdsInFolders(
    folderIds: number[]
  ): Promise<number[]> {
    if (folderIds.length === 0) return [];
    try {
      const questionIds = await $api<number[]>(
        "/backoffice/pastas/expandir-questoes",
        {
          method: "POST",
          body: { folderIds },
        }
      );
      return questionIds;
    } catch (error) {
      toast.add({
        title: "Erro ao buscar questões das pastas",
        color: "error",
      });
      return [];
    }
  }

  async function fetchQuestionsByIds(
    questionIds: number[]
  ): Promise<IQuestao[]> {
    if (questionIds.length === 0) return [];
    try {
      const questions = await $api<IQuestao[]>(
        "/backoffice/questoes/detalhes-por-ids",
        {
          method: "POST",
          body: { questionIds },
        }
      );
      return questions;
    } catch (error) {
      toast.add({
        title: "Erro ao buscar detalhes das questões",
        color: "error",
      });
      return [];
    }
  }

  return {
    items,
    breadcrumbs,
    isLoading,
    currentFolderId,
    rootFolderId,
    initialize,
    navigateToFolder,
    navigateToBreadcrumb,
    createFolder,
    createQuestion,
    deleteItem,
    updateItem,
    fetchAllQuestionIdsInFolders,
    fetchQuestionsByIds,
  };
});
