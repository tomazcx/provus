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
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { FileConverterProvider } from 'src/providers/file-converter.provider';

@Injectable()
export class ArquivoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly arquivoRepository: ArquivoRepository,
    private readonly dataSource: DataSource,
    private readonly storageProvider: StorageProvider,
    private readonly fileConverterProvider: FileConverterProvider,
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
    const pai = await this.itemSistemaArquivosRepository.findOne({
      where: {
        id: dto.paiId,
        tipo: TipoItemEnum.PASTA,
        avaliador: { id: avaliador.id },
      },
    });

    if (!pai) {
      throw new BadRequestException(
        `Pasta com id ${dto.paiId} não encontrada.`,
      );
    }

    let finalBuffer = dto.file;
    let finalContentType = dto.contentType;
    let finalExtension = this._getExtensionFromMime(dto.contentType);
    let finalTitulo = dto.titulo;

    if (this.fileConverterProvider.isConvertible(dto.contentType)) {
      finalBuffer = await this.fileConverterProvider.convertToPdf(
        dto.file,
        finalExtension,
      );

      finalContentType = 'application/pdf';
      finalExtension = 'pdf';

      if (!finalTitulo.toLowerCase().endsWith('.pdf')) {
        finalTitulo = finalTitulo.replace(/\.[^/.]+$/, '') + '.pdf';
      }
    }

    const timestamp = Date.now();
    const sanitizedTitle = finalTitulo.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}-${sanitizedTitle}`;

    const uploadResult = await this.storageProvider.uploadFile(
      finalBuffer,
      fileName,
      {
        contentType: finalContentType,
      },
    );

    if (!uploadResult.success) {
      throw new BadRequestException(
        `Falha no upload do arquivo: ${uploadResult.error}`,
      );
    }

    const newArquivoId = await this.arquivoRepository.createArquivo(
      {
        titulo: finalTitulo,
        url: uploadResult.url,
        descricao: dto.descricao,
        tamanhoEmBytes: finalBuffer.length,
        paiId: dto.paiId,
      },
      avaliador,
    );

    return this.findById(newArquivoId, avaliador);
  }

  private _getExtensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'pptx',
      'text/plain': 'txt',
      'application/rtf': 'rtf',
      'application/pdf': 'pdf',
      'application/vnd.oasis.opendocument.text': 'odt',
      'application/vnd.oasis.opendocument.presentation': 'odp',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
    };
    return map[mimeType] || 'bin';
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
