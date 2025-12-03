/* eslint-disable @typescript-eslint/no-unused-vars */
import type { QuestaoApiResponse } from "~/types/api/response/Questao.response";
import type {
  CreateQuestaoRequest,
  UpdateQuestaoRequest,
  GenerateAndSaveAiQuestaoRequest,
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
      childCount: (item as ItemSistemaArquivosApiResponse).childCount || 0,
    };
  }
}

export const useQuestionBankStore = defineStore("questionBank", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const items = ref<(QuestaoEntity | FolderEntity)[]>([]);
  const breadcrumbs = ref<{ id: number; titulo: string }[]>([]);
  const isLoading = ref(false);
  const isGenerating = ref(false);
  const rootFolderId = ref<number | null>(null);
  const isInitialized = ref(false);
  const pendingGenerations = ref(0);

  const isSocketListening = ref(false);

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

  async function startFileGenerationStream(
    payload: FormData,
    quantidade: number
  ) {
    pendingGenerations.value += quantidade;

    initializeWebSocket();

    try {
      if (currentFolderId.value) {
        payload.append("paiId", String(currentFolderId.value));
      }

      await $api("/backoffice/questao/generate-by-ai/stream-from-file", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Processamento iniciado",
        description: "Lendo arquivos e gerando questões...",
        color: "info",
      });
    } catch (error) {
      console.error("Erro no stream de arquivo:", error);
      pendingGenerations.value -= quantidade;
      toast.add({ title: "Erro ao iniciar geração", color: "error" });
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
      await $api("/backoffice/pastas", {
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
        paiId: currentFolderId.value ?? undefined,
      };

      await $api("/backoffice/questao/nova", { method: "POST", body: payload });
      toast.add({ title: "Questão criada com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao criar questão", color: "error" });
    }
  }

  async function createQuestionViaAi(
    payload: GenerateAndSaveAiQuestaoRequest | FormData
  ) {
    isGenerating.value = true;
    try {
      if (payload instanceof FormData) {
        if (currentFolderId.value) {
          payload.append("paiId", String(currentFolderId.value));
        }

        await $api("/backoffice/questao/generate-by-ai/save-from-file", {
          method: "POST",
          body: payload,
        });
      } else {
        const jsonPayload = {
          ...payload,
          paiId: currentFolderId.value,
        };

        await $api("/backoffice/questao/generate-by-ai/save", {
          method: "POST",
          body: jsonPayload,
        });
      }

      toast.add({
        title: "Questões geradas e salvas com sucesso!",
        color: "secondary",
        icon: "i-lucide-wand-2",
      });
      await refreshCurrentFolder();
    } catch (error) {
      console.error("Erro ao gerar questões via IA:", error);
      toast.add({
        title: "Erro ao gerar questões",
        description: "Ocorreu um erro na comunicação com a I.A.",
        color: "error",
      });
    } finally {
      isGenerating.value = false;
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

      const method = isFolderEntity(itemToUpdate) ? "PATCH" : "PUT";

      await $api(endpoint, { method, body: updatedData });
      toast.add({ title: "Item atualizado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao atualizar item", color: "error" });
    }
  }

  function initializeWebSocket() {
    const nuxtApp = useNuxtApp();
    const $websocket = nuxtApp.$websocket as
      | ReturnType<typeof useWebSocket>
      | undefined;

    if (!$websocket || !$websocket.socket.value) {
      return;
    }

    if (isSocketListening.value) {
      return;
    }

    const socket = $websocket.socket.value;

    socket.off("nova-questao-ia-gerada");
    socket.off("erro-geracao-ia");

    socket.on("nova-questao-ia-gerada", (data: any) => {
      const itemPaiId = data.questao.paiId;
      const currentId = currentFolderId.value;

      const isSameFolder = itemPaiId == currentId || (!itemPaiId && !currentId);
      if (isSameFolder) {
        const entity = mapApiResponseToEntity(data.questao);

        const exists = items.value.some((i) => i.id === entity.id);

        if (!exists) {
          items.value = [entity, ...items.value];
          console.log("Questão adicionada ao banco:", entity.id);
        }
      }

      if (pendingGenerations.value > 0) {
        pendingGenerations.value--;
      }

      toast.add({
        title: "Questão gerada!",
        description: isSameFolder
          ? "Adicionada ao topo da lista."
          : "Salva em outra pasta.",
        color: "success",
        icon: "i-lucide-check",
      });
    });

    socket.on("erro-geracao-ia", (data: any) => {
      if (pendingGenerations.value > 0) {
        pendingGenerations.value--;
      }
      toast.add({
        title: "Falha ao gerar uma questão",
        description: data.message,
        color: "error",
      });
    });

    isSocketListening.value = true;
  }

  function cleanupWebSocket() {
    const nuxtApp = useNuxtApp();
    const $websocket = nuxtApp.$websocket as
      | ReturnType<typeof useWebSocket>
      | undefined;

    const socket = $websocket?.socket.value;

    if (socket) {
      socket.off("nova-questao-ia-gerada");
      socket.off("erro-geracao-ia");
    }
    isSocketListening.value = false;
  }

  async function startGenerationStream(payload: any) {
    pendingGenerations.value += payload.quantidade;

    initializeWebSocket();

    await $api("/backoffice/questao/generate-by-ai/stream", {
      method: "POST",
      body: { ...payload, paiId: currentFolderId.value },
    });
  }

  async function fetchAllQuestionIdsInFolders(
    folderIds: number[]
  ): Promise<number[]> {
    if (folderIds.length === 0) return [];
    try {
      const response = await $api<{ questionIds: number[] }>(
        "/backoffice/pastas/expandir-questoes",
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
    isGenerating,
    currentFolderId,
    rootFolderId,
    pendingGenerations,
    initialize,
    navigateToFolder,
    navigateToBreadcrumb,
    createFolder,
    createQuestion,
    createQuestionViaAi,
    deleteItem,
    updateItem,
    fetchAllQuestionIdsInFolders,
    fetchQuestionsByIds,
    startGenerationStream,
    initializeWebSocket,
    cleanupWebSocket,
    startFileGenerationStream,
  };
});
