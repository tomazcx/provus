import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface ArquivoApiResponse {
  id: number;
  titulo: string;
  tipo: TipoItemEnum.ARQUIVO;
  paiId: number | null;
  url: string;
  descricao?: string;
  tamanhoEmBytes: number;
  criadoEm: string;
  atualizadoEm: string;
  path?: string;
}
