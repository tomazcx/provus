import { ApiProperty } from '@nestjs/swagger';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

export class ItemSistemaArquivosResponse {
  @ApiProperty({
    description: 'O ID único do item.',
    example: 42,
  })
  id: number;

  @ApiProperty({
    description: 'O título ou nome do item.',
    example: 'Minha Pasta de Questões',
  })
  titulo: string;

  @ApiProperty({
    description: 'A quantidade de itens dentro de uma pasta.',
    example: 5,
    required: false,
  })
  childCount?: number;

  @ApiProperty({
    description:
      'O tipo do item, para que o frontend possa renderizar o ícone correto.',
    enum: TipoItemEnum,
    example: TipoItemEnum.PASTA,
  })
  tipo: TipoItemEnum;

  @ApiProperty({
    description: 'O ID do item pai. É nulo se o item estiver na raiz.',
    example: 15,
    nullable: true,
  })
  paiId: number | null;

  @ApiProperty({
    description: 'A data de criação do item.',
  })
  criadoEm: Date;

  @ApiProperty({
    description: 'A data da última atualização do item.',
  })
  atualizadoEm: Date;

  static fromModel(
    model: ItemSistemaArquivosModel,
  ): ItemSistemaArquivosResponse {
    const response = new ItemSistemaArquivosResponse();
    response.id = model.id;
    response.titulo = model.titulo;
    response.tipo = model.tipo;
    response.paiId = model.paiId;
    response.criadoEm = model.criadoEm;
    response.atualizadoEm = model.atualizadoEm;

    if (model.tipo === TipoItemEnum.PASTA) {
      response.childCount = Number(model.childCount) || 0;
    }

    return response;
  }
}
