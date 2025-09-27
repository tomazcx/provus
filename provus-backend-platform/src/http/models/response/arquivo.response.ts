import { ApiProperty } from '@nestjs/swagger';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

export class ArquivoResponse {
  @ApiProperty({
    description: 'ID do arquivo.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título do arquivo.',
    example: 'Exemplo de arquivo',
  })
  titulo: string;

  @ApiProperty({
    description: 'URL do arquivo.',
    example: 'https://example.com/arquivo.pdf',
  })
  url: string;

  @ApiProperty({ type: 'number', nullable: true })
  paiId: number | null;

  @ApiProperty({
    description: 'Descrição do arquivo.',
    example: 'Descrição do arquivo',
  })
  descricao?: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes.',
    example: 1024,
  })
  tamanhoEmBytes: number;

  @ApiProperty({
    description: 'Caminho do arquivo.',
    example: 'Exemplo de caminho',
  })
  path?: string;

  @ApiProperty({
    description: 'Data de criação do arquivo.',
    example: '2021-01-01',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data de atualização do arquivo.',
    example: '2021-01-01',
  })
  atualizadoEm: string;

  static fromModel(model: ItemSistemaArquivosModel): ArquivoResponse {
    if (model.tipo !== TipoItemEnum.ARQUIVO || !model.arquivo) {
      throw new Error(
        `Item com ID ${model.id} não é um arquivo ou não teve os dados do arquivo carregados.`,
      );
    }

    const response = new ArquivoResponse();

    response.id = model.id;
    response.titulo = model.titulo;
    // response.tipo = TipoItemEnum.ARQUIVO;
    response.criadoEm = model.criadoEm.toISOString();
    response.atualizadoEm = model.atualizadoEm.toISOString();

    response.url = model.arquivo.url;
    response.descricao = model.arquivo.descricao;
    response.tamanhoEmBytes = model.arquivo.tamanhoEmBytes;

    response.paiId = model.pai ? model.pai.id : null;

    return response;
  }
}
