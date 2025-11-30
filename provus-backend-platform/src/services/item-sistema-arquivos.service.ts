import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { CreateItemDto } from 'src/dto/request/item-sistema-arquivos/create-item.dto';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { ArquivoModel } from 'src/database/config/models/arquivo.model';
import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { DataSource, EntityManager } from 'typeorm';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ConfiguracaoAvaliacaoModel } from 'src/database/config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from 'src/database/config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from 'src/database/config/models/configuracoes-seguranca.model';
import { ConfiguracoesRandomizacaoModel } from 'src/database/config/models/configuracoes-randomizacao.model';
import { PunicaoPorOcorrenciaModel } from 'src/database/config/models/punicao-por-ocorrencia.model';
import { QuestoesAvaliacoesModel } from 'src/database/config/models/questoes-avaliacoes.model';
import { ArquivosAvaliacoesModel } from 'src/database/config/models/arquivos-avaliacoes.model';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { StorageProvider } from 'src/providers/storage.provider';
import { UpdateItemRequest } from 'src/http/models/response/update-items.request';
import { QuestaoResponse } from 'src/http/models/response/questao.response';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';

type ConteudoPastaResponse =
  | ItemSistemaArquivosResponse
  | QuestaoResponse
  | ArquivoResponse
  | AvaliacaoResponse;
@Injectable()
export class ItemSistemaArquivosService {
  constructor(
    private readonly itemRepository: ItemSistemaArquivosRepository,
    private readonly dataSource: DataSource,
    private readonly storageProvider: StorageProvider,
  ) {}

  async findByFolder(
    paiId: number | null,
    avaliadorId: number,
  ): Promise<ConteudoPastaResponse[]> {
    const items = await this.itemRepository.findByParent(paiId, avaliadorId);

    const folderIds = items
      .filter((item) => item.tipo === TipoItemEnum.PASTA)
      .map((item) => item.id);

    let counts: { pai_id: number; count: string }[] = [];
    if (folderIds.length > 0) {
      counts = await this.itemRepository.query(
        'SELECT pai_id, COUNT(*)::text FROM item_sistema_arquivos WHERE pai_id = ANY($1) GROUP BY pai_id',
        [folderIds],
      );
    }

    const childCounts = new Map(counts.map((c) => [c.pai_id, Number(c.count)]));

    return items.map((item) => {
      if (item.tipo === TipoItemEnum.PASTA) {
        item.childCount = childCounts.get(item.id) || 0;
      }

      if (item.tipo === TipoItemEnum.QUESTAO && item.questao) {
        return QuestaoResponse.fromModel(item);
      }
      if (item.tipo === TipoItemEnum.ARQUIVO && item.arquivo) {
        return ArquivoResponse.fromModel(item);
      }
      if (item.tipo === TipoItemEnum.AVALIACAO && item.avaliacao) {
        return AvaliacaoResponse.fromModel(item);
      }
      return ItemSistemaArquivosResponse.fromModel(item);
    });
  }

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

  async findAllFileIdsInFolders(
    folderIds: number[],
    avaliadorId: number,
  ): Promise<number[]> {
    return this.itemRepository.findAllFileIdsInFolders(folderIds, avaliadorId);
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
        await this._deleteAvaliacaoWithConfigurations(itemId, manager);
        break;
      case TipoItemEnum.ARQUIVO: {
        const arquivo = await manager.findOne(ArquivoModel, {
          where: { id: itemId },
          relations: ['item'],
        });
        await manager.delete(ArquivoModel, { id: itemId });
        await this.storageProvider.deleteFile(arquivo.url);
        break;
      }
      case TipoItemEnum.PASTA:
        break;
    }

    await manager.delete(ItemSistemaArquivosModel, { id: itemId });
  }

  private async _deleteAvaliacaoWithConfigurations(
    avaliacaoId: number,
    manager: EntityManager,
  ): Promise<void> {
    const avaliacao = await manager.findOne(AvaliacaoModel, {
      where: { id: avaliacaoId },
      relations: [
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesSeguranca',
      ],
    });

    await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId });
    await manager.delete(ArquivosAvaliacoesModel, { avaliacaoId });

    await manager.delete(AplicacaoModel, { avaliacao: { id: avaliacaoId } });

    if (!avaliacao || !avaliacao.configuracaoAvaliacao) {
      await manager.delete(AvaliacaoModel, { id: avaliacaoId });
      return;
    }
    const configuracaoAvaliacaoId = avaliacao.configuracaoAvaliacao.id;
    const configuracoesGeraisId =
      avaliacao.configuracaoAvaliacao.configuracoesGerais?.id;
    const configuracoesSegurancaId =
      avaliacao.configuracaoAvaliacao.configuracoesSeguranca?.id;

    await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId });
    await manager.delete(ArquivosAvaliacoesModel, { avaliacaoId });

    if (configuracoesGeraisId) {
      const configuracoesRandomizacao = await manager.find(
        ConfiguracoesRandomizacaoModel,
        {
          where: { configuracoesGerais: { id: configuracoesGeraisId } },
          relations: ['poolDeQuestoes'],
        },
      );

      for (const configRandomizacao of configuracoesRandomizacao) {
        if (
          configRandomizacao.poolDeQuestoes &&
          configRandomizacao.poolDeQuestoes.length > 0
        ) {
          configRandomizacao.poolDeQuestoes = [];
          await manager.save(configRandomizacao);
        }
      }

      await manager.delete(ConfiguracoesRandomizacaoModel, {
        configuracoesGerais: { id: configuracoesGeraisId },
      });
    }

    if (configuracoesSegurancaId) {
      await manager.delete(PunicaoPorOcorrenciaModel, {
        configuracoesSegurancaId,
      });
    }

    await manager.delete(AvaliacaoModel, { id: avaliacaoId });

    await manager.delete(ConfiguracaoAvaliacaoModel, {
      id: configuracaoAvaliacaoId,
    });

    if (configuracoesGeraisId) {
      await manager.delete(ConfiguracoesGeraisModel, {
        id: configuracoesGeraisId,
      });
    }

    if (configuracoesSegurancaId) {
      await manager.delete(ConfiguracoesSegurancaModel, {
        id: configuracoesSegurancaId,
      });
    }
  }

  async updateTitle(
    itemId: number,
    avaliadorId: number,
    dto: UpdateItemRequest,
  ): Promise<ItemSistemaArquivosModel> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, avaliador: { id: avaliadorId } },
    });

    if (!item) {
      throw new NotFoundException(`Item com id ${itemId} não encontrado.`);
    }

    item.titulo = dto.titulo;

    return this.itemRepository.save(item);
  }

  async findAllQuestionIdsInFolders(
    folderIds: number[],
    avaliadorId: number,
  ): Promise<number[]> {
    return this.itemRepository.findAllQuestionIdsInFolders(
      folderIds,
      avaliadorId,
    );
  }
}
