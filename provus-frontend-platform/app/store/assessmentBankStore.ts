import { defineStore } from "pinia";
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type {
  AvaliacaoApiResponse,
  AvaliacaoListItemApiResponse,
} from "~/types/api/response/Avaliacao.response";
import type { ItemSistemaArquivosApiResponse } from "~/types/api/response/ItemSistemaArquivos.response";
import type {
  CreateAvaliacaoRequest,
  UpdateAvaliacaoRequest,
} from "~/types/api/request/Avaliacao.request";
import TipoItemEnum from "~/enums/TipoItemEnum";
import { getBlankAssessment } from "./assessmentStore";
import { mapAvaliacaoApiResponseToEntity } from "~/mappers/assessment.mapper";
import isFolder from "~/guards/isFolder";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";

function mapListApiResponseToEntity(
  item: AvaliacaoListItemApiResponse | ItemSistemaArquivosApiResponse
): AvaliacaoEntity | FolderEntity {
  if (item.tipo === TipoItemEnum.AVALIACAO) {
    const avaliacaoItem = item as AvaliacaoListItemApiResponse;
    return {
      id: avaliacaoItem.id,
      titulo: avaliacaoItem.titulo,
      tipo: TipoItemEnum.AVALIACAO,
      paiId: avaliacaoItem.paiId,
      criadoEm: avaliacaoItem.criadoEm,
      atualizadoEm: avaliacaoItem.atualizadoEm,
      descricao: avaliacaoItem.descricao,
      isModelo: avaliacaoItem.isModelo,
      path: avaliacaoItem.path,
      pontuacao: avaliacaoItem.questoes.reduce(
        (acc, q) => acc + q.pontuacao,
        0
      ),
      questoes: (avaliacaoItem.questoes || []).map((q, index) => ({
        id: index,
        titulo: `Questão ${index + 1}`,
        tipo: TipoItemEnum.QUESTAO,
        paiId: null,
        criadoEm: "",
        atualizadoEm: "",
        dificuldade: DificuldadeQuestaoEnum.FACIL,
        tipoQuestao: TipoQuestaoEnum.OBJETIVA,
        pontuacao: q.pontuacao || 0,
        isModelo: false,
        alternativas: [],
      })) as QuestaoEntity[],
      arquivos: [],
      configuracao: getBlankAssessment().configuracao,
    };
  } else {
    return {
      id: item.id,
      titulo: item.titulo,
      tipo: TipoItemEnum.PASTA,
      paiId: item.paiId,
      criadoEm: item.criadoEm,
      atualizadoEm: item.atualizadoEm,
      childCount: (item as ItemSistemaArquivosApiResponse).childCount,
    };
  }
}

export const useExamBankStore = defineStore("examBank", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const rootFolderTitle = ref<string>("");
  const items = ref<(AvaliacaoEntity | FolderEntity)[]>([]);
  const breadcrumbs = ref<{ id: number; titulo: string }[]>([]);
  const isLoading = ref(false);
  const rootFolderId = ref<number | null>(null);
  const isInitialized = ref(false);

  const currentFolderId = computed(
    () => breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? null
  );

  async function fetchFolderContent(folderId: number) {
    isLoading.value = true;
    try {
      const endpoint =
        folderId === rootFolderId.value
          ? "/backoffice/bancos-de-conteudo/AVALIACOES/conteudo"
          : `/backoffice/pastas/${folderId}/conteudo`;

      const response = await $api<
        (AvaliacaoListItemApiResponse | ItemSistemaArquivosApiResponse)[]
      >(endpoint);

      const filteredResponse = response.filter(
        (item) =>
          item.tipo === TipoItemEnum.AVALIACAO ||
          item.tipo === TipoItemEnum.PASTA
      );

      items.value = filteredResponse.map(mapListApiResponseToEntity);
    } catch {
      toast.add({ title: "Erro ao buscar avaliações", color: "error" });
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
      const bancoDeAvaliacoes = bancos.find(
        (b) => b.tipoBanco === "AVALIACOES"
      );

      if (!bancoDeAvaliacoes) {
        throw new Error("Banco de Avaliações não encontrado.");
      }

      rootFolderId.value = bancoDeAvaliacoes.pastaId;
      rootFolderTitle.value = bancoDeAvaliacoes.titulo;
      breadcrumbs.value = [
        { id: bancoDeAvaliacoes.pastaId, titulo: bancoDeAvaliacoes.titulo },
      ];
      await fetchFolderContent(bancoDeAvaliacoes.pastaId);
      isInitialized.value = true;
    } catch {
      toast.add({
        title: "Erro ao inicializar o banco de avaliações",
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function resetNavigation() {
    if (!rootFolderId.value) return;
    breadcrumbs.value = [
      {
        id: rootFolderId.value,
        titulo: rootFolderTitle.value || "Banco de Avaliações",
      },
    ];
    await fetchFolderContent(rootFolderId.value);
  }

  async function refreshCurrentFolder() {
    if (currentFolderId.value !== null) {
      await fetchFolderContent(currentFolderId.value);
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

  async function createFolder(newFolderData: { titulo: string }) {
    try {
      await $api("/backoffice/pastas", {
        method: "POST",
        body: {
          titulo: newFolderData.titulo,
          paiId: currentFolderId.value,
        },
      });
      toast.add({ title: "Pasta criada com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao criar pasta",
        description: errorMessage,
        color: "error",
      });
    }
  }

  async function createModelo(modeloData: CreateAvaliacaoRequest) {
    try {
      const payload = { ...modeloData, paiId: currentFolderId.value };
      await $api("/backoffice/avaliacao", { method: "POST", body: payload });
      toast.add({
        title: "Modelo de avaliação salvo com sucesso!",
        color: "secondary",
      });
      await refreshCurrentFolder();
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao salvar modelo",
        description: errorMessage,
        color: "error",
      });
    }
  }

  async function updateItem(
    itemToUpdate: AvaliacaoEntity | FolderEntity,
    updatedData: UpdateAvaliacaoRequest | { titulo: string }
  ) {
    try {
      const isFolderUpdate = isFolder(itemToUpdate);
      const endpoint = isFolderUpdate
        ? `/backoffice/item-sistema-arquivos/${itemToUpdate.id}`
        : `/backoffice/avaliacao/${itemToUpdate.id}`;

      const method = isFolderUpdate ? "PATCH" : "PUT";

      await $api(endpoint, { method, body: updatedData });
      toast.add({ title: "Item atualizado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao atualizar item",
        description: errorMessage,
        color: "error",
      });
    }
  }

  async function deleteItem(itemToDelete: AvaliacaoEntity | FolderEntity) {
    try {
      await $api(`/backoffice/item-sistema-arquivos/${itemToDelete.id}`, {
        method: "DELETE",
      });
      toast.add({ title: "Item deletado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao deletar item",
        description: errorMessage,
        color: "error",
      });
    }
  }

  async function getItemById(id: number): Promise<AvaliacaoEntity | undefined> {
    isLoading.value = true;
    try {
      const response = await $api<AvaliacaoApiResponse>(
        `/backoffice/avaliacao/${id}`
      );
      return mapAvaliacaoApiResponseToEntity(response);
    } catch {
      toast.add({
        title: "Erro ao buscar detalhes da avaliação",
        color: "error",
      });
      return undefined;
    } finally {
      isLoading.value = false;
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
    createModelo,
    updateItem,
    deleteItem,
    getItemById,
    fetchFolderContent,
    resetNavigation,
  };
});
