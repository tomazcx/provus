export class CreateAndUploadArquivoDto {
  titulo: string;
  descricao: string;
  paiId?: number;
  file: Buffer;
  contentType: string;
}
