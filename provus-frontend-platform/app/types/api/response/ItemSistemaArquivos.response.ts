import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface ItemSistemaArquivosApiResponse {
  id: number;
  titulo: string;
  tipo: TipoItemEnum;
  paiId: number | null;
  avaliadorId: number;
  criadoEm: string;
  atualizadoEm: string;
  path?: string;
  childCount?: number;
}
