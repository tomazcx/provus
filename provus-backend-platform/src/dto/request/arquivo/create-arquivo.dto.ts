export class CreateArquivoDto {
  titulo: string;
  url: string;
  descricao: string;
  tamanhoEmBytes: number;
  paiId: number | null;
}
