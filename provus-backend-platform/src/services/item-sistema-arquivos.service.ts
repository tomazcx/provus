import { Injectable, BadRequestException } from '@nestjs/common';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { Avaliador } from 'src/domain/entities/avaliador.entity';
import { CreateItemDto } from 'src/dto/request/item-sistema-arquivos/create-item.dto';

@Injectable()
export class ItemSistemaArquivosService {
  constructor(private readonly itemRepository: ItemSistemaArquivosRepository) {}

  async create(
    dto: CreateItemDto,
    avaliador: Avaliador,
  ): Promise<ItemSistemaArquivosModel> {
    let pai: ItemSistemaArquivosModel | null = null;
    if (dto.paiId) {
      pai = await this.itemRepository.findOneBy({
        id: dto.paiId,
        avaliador: { id: avaliador.id },
      });
      if (!pai) {
        throw new BadRequestException(
          `Pasta com id ${dto.paiId} não encontrada.`,
        );
      }
    }

    const newItem = this.itemRepository.create({
      titulo: dto.titulo,
      tipo: dto.tipo,
      avaliador,
      pai,
    });

    return this.itemRepository.save(newItem);
  }

  async getFullPath(itemId: number): Promise<string> {
    return this.itemRepository.findPathById(itemId);
  }
}
