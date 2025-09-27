/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { ArquivoApiResponse } from "~/types/api/response/Arquivo.response";
import type { ItemSistemaArquivosApiResponse } from "~/types/api/response/ItemSistemaArquivos.response";
import TipoItemEnum from "~/enums/TipoItemEnum";
import type { UpdateArquivoRequest } from "~/types/api/request/Arquivo.request";

function isFolderEntity(
  item: ArquivoEntity | FolderEntity
): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

function mapApiResponseToEntity(
  item: ArquivoApiResponse | ItemSistemaArquivosApiResponse
): ArquivoEntity | FolderEntity {
  const isArquivo = "url" in item;

  if (isArquivo) {
    return {
      id: item.id,
      titulo: item.titulo,
      tipo: TipoItemEnum.ARQUIVO,
      paiId: item.paiId,
      criadoEm: new Date(item.criadoEm).toISOString(),
      atualizadoEm: new Date(item.atualizadoEm).toISOString(),
      path: item.path,
      url: item.url,
      descricao: item.descricao,
      tamanhoEmBytes: item.tamanhoEmBytes,
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

export const useMaterialsBankStore = defineStore("materialsBank", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const items = ref<(ArquivoEntity | FolderEntity)[]>([]);
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
          ? "/backoffice/bancos-de-conteudo/MATERIAIS/conteudo"
          : `/backoffice/pastas/${folderId}/conteudo`;

      const response = await $api<
        (ArquivoApiResponse | ItemSistemaArquivosApiResponse)[]
      >(endpoint);
      items.value = response.map(mapApiResponseToEntity);
    } catch (error) {
      toast.add({ title: "Erro ao buscar materiais", color: "error" });
      console.error("Erro ao buscar itens do banco de materiais:", error);
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
      const bancoDeMateriais = bancos.find((b) => b.tipoBanco === "MATERIAIS");

      if (!bancoDeMateriais) {
        throw new Error(
          "Banco de Materiais não foi encontrado para este usuário."
        );
      }

      rootFolderId.value = bancoDeMateriais.pastaId;
      breadcrumbs.value = [
        { id: bancoDeMateriais.pastaId, titulo: bancoDeMateriais.titulo },
      ];
      await fetchFolderContent(bancoDeMateriais.pastaId);
      isInitialized.value = true;
    } catch (error) {
      toast.add({
        title: "Erro ao inicializar o banco de materiais",
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
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
          tipo: TipoItemEnum.PASTA,
        },
      });
      toast.add({ title: "Pasta criada com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao criar pasta", color: "error" });
    }
  }

  async function createFile(formData: FormData) {
    try {
      if (currentFolderId.value) {
        formData.append("paiId", String(currentFolderId.value));
      }

      await $api("/backoffice/arquivo", {
        method: "POST",
        body: formData,
      });
      toast.add({ title: "Arquivo enviado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro no upload do arquivo", color: "error" });
      console.error("Erro ao criar arquivo:", error);
    }
  }

  async function updateItem(
    itemToUpdate: ArquivoEntity | FolderEntity,
    updatedData: UpdateArquivoRequest | { titulo: string }
  ) {
    try {
      const endpoint = isFolderEntity(itemToUpdate)
        ? `/backoffice/item-sistema-arquivos/${itemToUpdate.id}`
        : `/backoffice/arquivo/${itemToUpdate.id}`;

      await $api(endpoint, { method: "PATCH", body: updatedData });
      toast.add({ title: "Item atualizado com sucesso!", color: "secondary" });
      await refreshCurrentFolder();
    } catch (error) {
      toast.add({ title: "Erro ao atualizar item", color: "error" });
    }
  }

  async function deleteItem(itemToDelete: ArquivoEntity | FolderEntity) {
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
    createFile,
    updateItem,
    deleteItem,
  };
});
