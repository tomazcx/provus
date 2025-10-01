import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface ItemEntity {
  id: number;
  titulo: string;
  tipo: TipoItemEnum;
  paiId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  path?: string;
}

export interface FolderEntity extends ItemEntity {
  tipo: TipoItemEnum.PASTA;
  childCount?: number;
}
