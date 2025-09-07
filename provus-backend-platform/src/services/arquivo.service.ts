import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { UpdateArquivoRequest } from 'src/http/controllers/backoffice/arquivo/update-arquivo/request';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { DataSource, In } from 'typeorm';
import { ArquivoRepository } from 'src/database/repositories/arquivo.repository';
import { ArquivoDto } from 'src/dto/result/arquivo/arquivo.dto';
import { ArquivoModel } from 'src/database/config/models/arquivo.model';
import { StorageProvider } from 'src/providers/storage.provider';
import { CreateAndUploadArquivoDto } from 'src/dto/request/arquivo/create-and-upload-arquivo.dto';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Injectable()
export class ArquivoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly arquivoRepository: ArquivoRepository,
    private readonly dataSource: DataSource,
    private readonly storageProvider: StorageProvider,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<ArquivoDto> {
    const arquivoModel = await this.arquivoRepository.findOne({
      where: { id, item: { avaliador: { id: avaliador.id } } },
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
    dto: CreateAndUploadArquivoDto,
    avaliador: AvaliadorModel,
  ): Promise<ArquivoDto> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${dto.titulo}`;

    const uploadResult = await this.storageProvider.uploadFile(
      dto.file,
      fileName,
      {
        contentType: dto.contentType,
      },
    );

    if (!uploadResult.success) {
      throw new BadRequestException(
        `Falha no upload do arquivo: ${uploadResult.error}`,
      );
    }

    const newArquivoId = await this.arquivoRepository.createArquivo(
      {
        titulo: dto.titulo,
        url: uploadResult.url,
        descricao: dto.descricao,
        tamanhoEmBytes: dto.file.length,
        paiId: dto.paiId,
      },
      avaliador,
    );

    return this.findById(newArquivoId, avaliador);
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
