/* eslint-disable @typescript-eslint/no-unused-vars */
import type { QuestaoApiResponse } from "~/types/api/response/Questao.response";
import type {
  CreateQuestaoRequest,
  UpdateQuestaoRequest,
} from "~/types/api/request/Questao.request";
import type { FolderEntity, ItemEntity } from "~/types/entities/Item.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import TipoItemEnum from "~/enums/TipoItemEnum";
import type { ItemSistemaArquivosApiResponse } from "~/types/api/response/ItemSistemaArquivos.response";

function isFolderEntity(item: ItemEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

function mapApiResponseToEntity(
  item: QuestaoApiResponse | ItemSistemaArquivosApiResponse
): QuestaoEntity | FolderEntity {
  const isQuestao = "tipoQuestao" in item;

  if (isQuestao) {
    return {
      id: item.id,
      titulo: item.titulo,
      tipo: TipoItemEnum.QUESTAO,
      paiId: item.paiId,
      criadoEm: new Date(item.criadoEm).toISOString(),
      atualizadoEm: new Date(item.atualizadoEm).toISOString(),
      path: item.path,
      dificuldade: item.dificuldade,
      tipoQuestao: item.tipoQuestao,
      descricao: item.descricao,
      pontuacao: item.pontuacao,
      isModelo: item.isModelo,
      alternativas: item.alternativas || [],
      exemploRespostaIa: item.exemploRespostaIa,
      textoRevisao: item.textoRevisao,
    };
  } else {
    return {
      id: item.id,
      titulo: item.titulo,
      tipo: TipoItemEnum.PASTA,
      paiId: item.paiId,
      criadoEm: new Date(item.criadoEm).toISOString(),
      atualizadoEm: new Date(item.atualizadoEm).toISOString(),
    };
  }
}

export const useQuestionBankStore = defineStore("questionBank", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const items = ref<(QuestaoEntity | FolderEntity)[]>([]);
  const breadcrumbs = ref<{ id: number; titulo: string }[]>([]);
  const isLoading = ref(false);
  const rootFolderId = ref<number | null>(null);
  const isInitialized = ref(false);

  const currentFolderId = computed(
    () => breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? null
  );

  console.log("Current Folder ID:", currentFolderId.value);

  async function fetchFolderContent(folderId: number) {
    isLoading.value = true;
    try {
      const endpoint =
        folderId === rootFolderId.value
          ? "/backoffice/bancos-de-conteudo/QUESTOES/conteudo"
          : `/backoffice/pastas/${folderId}/conteudo`;
      const response = await $api<
        (QuestaoApiResponse | ItemSistemaArquivosApiResponse)[]
      >(endpoint);
      items.value = response.map(mapApiResponseToEntity);
    } catch (error) {
      console.log(error);
      toast.add({ title: "Erro ao buscar itens", color: "error" });
      console.error("Erro ao buscar itens do banco de questões:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function initialize() {
    if (isInitialized.value) return;
    isLoading.value = true;
    try {
      const bancos = await $api<
        { tipoBanco: string; titulo: string; pastaId: number }[]
      >("/backoffice/bancos-de-conteudo");
      const bancoDeQuestoes = bancos.find((b) => b.tipoBanco === "QUESTOES");

      if (!bancoDeQuestoes) {
        throw new Error("Banco de Questões não encontrado para este usuário.");
      }

      rootFolderId.value = bancoDeQuestoes.pastaId;
      breadcrumbs.value = [
        { id: bancoDeQuestoes.pastaId, titulo: bancoDeQuestoes.titulo },
      ];
      await fetchFolderContent(bancoDeQuestoes.pastaId);
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

  async function navigateToFolder(folder: FolderEntity) {
    breadcrumbs.value.push({ id: folder.id, titulo: folder.titulo });
    await fetchFolderContent(folder.id);
  }

  async function navigateToBreadcrumb(breadcrumbIndex: number) {
    const targetCrumb = breadcrumbs.value[breadcrumbIndex];
    if (!targetCrumb) return;
    breadcrumbs.value = breadcrumbs.value.slice(0, breadcrumbIndex + 1);
    await fetchFolderContent(targetCrumb.id);
  }

  async function refreshCurrentFolder() {
    if (currentFolderId.value !== null) {
      await fetchFolderContent(currentFolderId.value);
    }
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
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao criar pasta", color: "error" });
    }
  }

  async function createQuestion(formData: CreateQuestaoRequest) {
    try {
      const payload: CreateQuestaoRequest = {
        ...formData,
        ...(currentFolderId.value !== null
          ? { paiId: currentFolderId.value }
          : {}),
      };
      await $api("/backoffice/questao/nova", { method: "POST", body: payload });
      toast.add({ title: "Questão criada com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao criar questão", color: "error" });
    }
  }

  async function deleteItem(itemToDelete: QuestaoEntity | FolderEntity) {
    try {
      await $api(`/backoffice/item-sistema-arquivos/${itemToDelete.id}`, {
        method: "DELETE",
      });
      toast.add({ title: "Item deletado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao deletar item", color: "error" });
    }
  }

  async function updateItem(
    itemToUpdate: QuestaoEntity | FolderEntity,
    updatedData: UpdateQuestaoRequest | { titulo: string }
  ) {
    try {
      const endpoint = isFolderEntity(itemToUpdate)
        ? `/backoffice/item-sistema-arquivos/${itemToUpdate.id}`
        : `/backoffice/questao/${itemToUpdate.id}`;

      await $api(endpoint, { method: "PATCH", body: updatedData });
      toast.add({ title: "Item atualizado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao atualizar item", color: "error" });
    }
  }

  async function fetchAllQuestionIdsInFolders(
    folderIds: number[]
  ): Promise<number[]> {
    if (folderIds.length === 0) return [];
    try {
      const response = await $api<{ questionIds: number[] }>(
        "/backoffice/item-sistema-arquivos/expandir-questoes",
        {
          method: "POST",
          body: { folderIds },
        }
      );
      return response.questionIds;
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
  ): Promise<QuestaoEntity[]> {
    if (questionIds.length === 0) return [];
    try {
      const response = await $api<QuestaoApiResponse[]>(
        "/backoffice/questoes/detalhes-por-ids",
        {
          method: "POST",
          body: { questionIds },
        }
      );
      return response.map((item) =>
        mapApiResponseToEntity(item)
      ) as QuestaoEntity[];
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
