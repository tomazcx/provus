import TipoItemEnum from 'src/domain/enums/tipo-item.enum';

export abstract class CreateItemDto {
  titulo: string;
  tipo: TipoItemEnum;
  avaliadorId: number;
  paiId?: number;
}
