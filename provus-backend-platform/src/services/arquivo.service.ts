import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { UpdateArquivoRequest } from 'src/http/controllers/backoffice/arquivo/update-arquivo/request';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { DataSource, In } from 'typeorm';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ArquivoRepository } from 'src/database/repositories/arquivo.repository';
import { ArquivoDto } from 'src/dto/result/arquivo/arquivo.dto';
import { CreateArquivoRequest } from 'src/http/controllers/backoffice/arquivo/create-arquivo/request';
import { ArquivoModel } from 'src/database/config/models/arquivo.model';

@Injectable()
export class ArquivoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly arquivoRepository: ArquivoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number): Promise<ArquivoDto> {
    const arquivoModel = await this.arquivoRepository.findOne({
      where: { id },
      relations: ['item'],
    });

    if (!arquivoModel) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const path = await this.itemSistemaArquivosRepository.findPathById(id);

    return new ArquivoDto(arquivoModel, path);
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<ArquivoDto[]> {
    const arquivosModels = await this.arquivoRepository.findAllByPasta(
      pastaId,
      avaliadorId,
    );

    const dtosPromises = arquivosModels.map(async (arquivoModel) => {
      const path = await this.itemSistemaArquivosRepository.findPathById(
        arquivoModel.id,
      );

      return new ArquivoDto(arquivoModel, path);
    });

    return Promise.all(dtosPromises);
  }

  async create(
    dto: CreateArquivoRequest,
    avaliador: AvaliadorModel,
  ): Promise<ArquivoDto> {
    const newArquivoId = await this.arquivoRepository.createArquivo(
      {
        titulo: dto.titulo,
        url: `https://provus-backend-platform.s3.amazonaws.com/${dto.titulo}`,
        descricao: dto.descricao,
        tamanhoEmBytes: 0,
        paiId: dto.paiId,
      },
      avaliador,
    );

    return this.findById(newArquivoId);
  }

  async update(
    id: number,
    avaliadorId: number,
    dto: UpdateArquivoRequest,
  ): Promise<ArquivoDto> {
    const resultDto = await this.dataSource.transaction(async (manager) => {
      const arquivoRepo = manager.getRepository(ArquivoModel);
      const itemRepo = manager.getRepository(ItemSistemaArquivosModel);

      const arquivo = await arquivoRepo.findOne({
        where: { id, item: { avaliador: { id: avaliadorId } } },
        relations: ['item'],
      });

      if (!arquivo) {
        throw new NotFoundException(
          `Arquivo com id ${id} não encontrada ou não pertence a você.`,
        );
      }

      if (dto.titulo) {
        arquivo.item.titulo = dto.titulo;
        await itemRepo.save(arquivo.item);
      }

      if (dto.descricao) {
        arquivo.descricao = dto.descricao;
      }

      await arquivoRepo.save(arquivo);

      const arquivoAtualizado = await manager.findOne(ArquivoModel, {
        where: { id },
        relations: ['item'],
      });

      const path = await this.itemSistemaArquivosRepository.findPathById(id);

      return new ArquivoDto(arquivoAtualizado, path);
    });

    return resultDto;
  }

  async findByIds(
    arquivoIds: number[],
    avaliadorId: number,
  ): Promise<ArquivoDto[]> {
    if (arquivoIds.length === 0) {
      return [];
    }

    const arquivosModels = await this.arquivoRepository.find({
      where: {
        id: In(arquivoIds),
        item: { avaliador: { id: avaliadorId } },
      },
      relations: ['item'],
    });

    const dtosPromises = arquivosModels.map(async (arquivoModel) => {
      const path = await this.itemSistemaArquivosRepository.findPathById(
        arquivoModel.id,
      );

      return new ArquivoDto(arquivoModel, path);
    });

    return Promise.all(dtosPromises);
  }
}
