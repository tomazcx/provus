import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { CreateItemDto } from 'src/dto/request/item-sistema-arquivos/create-item.dto';
import TipoItemEnum from 'src/domain/enums/tipo-item.enum';
import { ArquivoModel } from 'src/database/config/models/arquivo.model';
import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { DataSource, EntityManager } from 'typeorm';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Injectable()
export class ItemSistemaArquivosService {
  constructor(
    private readonly itemRepository: ItemSistemaArquivosRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateItemDto,
    avaliador: AvaliadorModel,
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

  async delete(itemId: number, avaliadorId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this._recursiveDelete(itemId, avaliadorId, manager);
    });
  }

  private async _recursiveDelete(
    itemId: number,
    avaliadorId: number,
    manager: EntityManager,
  ): Promise<void> {
    const item = await manager.findOne(ItemSistemaArquivosModel, {
      where: { id: itemId, avaliador: { id: avaliadorId } },
      relations: ['filhos'],
    });

    if (!item) {
      throw new NotFoundException(`Item com id ${itemId} não encontrado.`);
    }

    if (item.filhos && item.filhos.length > 0) {
      for (const filho of item.filhos) {
        await this._recursiveDelete(filho.id, avaliadorId, manager);
      }
    }

    switch (item.tipo) {
      case TipoItemEnum.QUESTAO:
        await manager.delete(AlternativaModel, { questao: { id: itemId } });
        await manager.delete(QuestaoModel, { id: itemId });
        break;
      case TipoItemEnum.AVALIACAO:
        await manager.delete(AvaliacaoModel, { id: itemId });
        break;
      case TipoItemEnum.ARQUIVO:
        await manager.delete(ArquivoModel, { id: itemId });
        break;
      case TipoItemEnum.PASTA:
        break;
    }

    await manager.delete(ItemSistemaArquivosModel, { id: itemId });
  }
}
