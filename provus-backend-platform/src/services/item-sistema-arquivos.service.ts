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
import { IpsPermitidosModel } from 'src/database/config/models/ips-permitidos.model';
import { ConfiguracaoNotificacaoModel } from 'src/database/config/models/configuracao-notificacao.model';
import { QuestoesAvaliacoesModel } from 'src/database/config/models/questoes-avaliacoes.model';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { StorageProvider } from 'src/providers/storage.provider';

@Injectable()
export class ItemSistemaArquivosService {
  constructor(
    private readonly itemRepository: ItemSistemaArquivosRepository,
    private readonly dataSource: DataSource,
    private readonly storageProvider: StorageProvider,
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

  async findByFolder(
    paiId: number | null,
    avaliadorId: number,
  ): Promise<ItemSistemaArquivosResponse[]> {
    const items = await this.itemRepository.findByParent(paiId, avaliadorId);

    return items.map((item) => ItemSistemaArquivosResponse.fromModel(item));
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
        await this._deleteAvaliacaoWithConfigurations(itemId, manager);
        break;
      case TipoItemEnum.ARQUIVO:
        const arquivo = await manager.findOne(ArquivoModel, {
          where: { id: itemId },
          relations: ['item'],
        });
        await manager.delete(ArquivoModel, { id: itemId });
        await this.storageProvider.deleteFile(arquivo.url);
        break;
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

    if (!avaliacao || !avaliacao.configuracaoAvaliacao) {
      await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId });
      await manager.delete(AvaliacaoModel, { id: avaliacaoId });
      return;
    }

    const configuracaoAvaliacaoId = avaliacao.configuracaoAvaliacao.id;
    const configuracoesGeraisId =
      avaliacao.configuracaoAvaliacao.configuracoesGerais?.id;
    const configuracoesSegurancaId =
      avaliacao.configuracaoAvaliacao.configuracoesSeguranca?.id;

    await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId });

    if (configuracoesGeraisId) {
      await manager.delete(ConfiguracoesRandomizacaoModel, {
        configuracoesGerais: { id: configuracoesGeraisId },
      });
    }

    if (configuracoesSegurancaId) {
      await manager.delete(PunicaoPorOcorrenciaModel, {
        configuracoesSegurancaId,
      });
      await manager.delete(IpsPermitidosModel, {
        configuracoesSegurancaId,
      });
      await manager.delete(ConfiguracaoNotificacaoModel, {
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
