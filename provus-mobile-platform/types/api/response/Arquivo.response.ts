export interface ArquivoApiResponse {
  id: number;
  titulo: string;
  tipo: any;
  paiId: number | null;
  url: string;
  descricao?: string;
  tamanhoEmBytes: number;
  criadoEm: string;
  atualizadoEm: string;
  path?: string;
}
