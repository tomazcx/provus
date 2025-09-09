import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
import { CreateAvaliacaoDto } from 'src/dto/request/avaliacao/create-avaliacao.dto';
import { ItemSistemaArquivosModel } from '../config/models/item-sistema-arquivos.model';
import { ConfiguracaoAvaliacaoModel } from '../config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from '../config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from '../config/models/punicao-por-ocorrencia.model';
import { IpsPermitidosModel } from '../config/models/ips-permitidos.model';
import { ConfiguracaoNotificacaoModel } from '../config/models/configuracao-notificacao.model';
import { QuestoesAvaliacoesModel } from '../config/models/questoes-avaliacoes.model';
import { ArquivosAvaliacoesModel } from '../config/models/arquivos-avaliacoes.model';
import { ConfiguracoesRandomizacaoModel } from '../config/models/configuracoes-randomizacao.model';
import { QuestaoModel } from '../config/models/questao.model';

@Injectable()
export class AvaliacaoRepository extends Repository<AvaliacaoModel> {
  constructor(private dataSource: DataSource) {
    super(AvaliacaoModel, dataSource.createEntityManager());
  }

  async createAvaliacao(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const itemSistemaArquivos = new ItemSistemaArquivosModel();
      itemSistemaArquivos.titulo = dto.titulo;
      itemSistemaArquivos.tipo = TipoItemEnum.AVALIACAO;
      itemSistemaArquivos.avaliador = avaliador;

      if (dto.paiId) {
        const pai = await manager.findOne(ItemSistemaArquivosModel, {
          where: { id: dto.paiId },
        });
        itemSistemaArquivos.pai = pai;
      }

      const savedItem = await manager.save(itemSistemaArquivos);

      const avaliacao = new AvaliacaoModel();
      avaliacao.id = savedItem.id;
      avaliacao.item = savedItem;
      avaliacao.descricao = dto.descricao;
      avaliacao.isModelo = dto.isModelo;

      const savedAvaliacao = await manager.save(avaliacao);

      const savedConfiguracaoAvaliacao = await this._createConfigurations(
        manager,
        dto,
      );

      savedAvaliacao.configuracaoAvaliacao = savedConfiguracaoAvaliacao;
      await manager.save(savedAvaliacao);

      if (dto.questoes && dto.questoes.length > 0) {
        const questoesAvaliacoes = dto.questoes.map((questaoDto) => {
          const questaoAvaliacao = new QuestoesAvaliacoesModel();
          questaoAvaliacao.questaoId = questaoDto.questaoId;
          questaoAvaliacao.avaliacaoId = savedAvaliacao.id;
          questaoAvaliacao.ordem = questaoDto.ordem;
          questaoAvaliacao.pontuacao = questaoDto.pontuacao;
          return questaoAvaliacao;
        });

        await manager.save(questoesAvaliacoes);
      }

      if (dto.arquivos && dto.arquivos.length > 0) {
        const arquivosAvaliacoes = dto.arquivos.map((arquivoDto) => {
          const arquivoAvaliacao = new ArquivosAvaliacoesModel();
          arquivoAvaliacao.arquivoId = arquivoDto.arquivoId;
          arquivoAvaliacao.avaliacaoId = savedAvaliacao.id;
          arquivoAvaliacao.permitirConsultaPorEstudante =
            arquivoDto.permitirConsultaPorEstudante;
          return arquivoAvaliacao;
        });

        await manager.save(arquivosAvaliacoes);
      }

      return savedAvaliacao.id;
    });
  }

  async updateAvaliacao(
    id: number,
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const avaliacao = await manager.findOne(AvaliacaoModel, {
        where: { id, item: { avaliador: { id: avaliador.id } } },
        relations: [
          'item',
          'configuracaoAvaliacao',
          'configuracaoAvaliacao.configuracoesGerais',
          'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
          'configuracaoAvaliacao.configuracoesSeguranca',
          'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
          'configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
          'configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        ],
      });

      avaliacao.item.titulo = dto.titulo;
      await manager.save(avaliacao.item);

      avaliacao.descricao = dto.descricao;
      avaliacao.isModelo = dto.isModelo;
      await manager.save(avaliacao);

      await this._clearOldConfigurations(manager, avaliacao);

      avaliacao.configuracaoAvaliacao = await this._createConfigurations(
        manager,
        dto,
      );
      await manager.save(avaliacao);

      await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId: id });

      if (dto.questoes && dto.questoes.length > 0) {
        const questoesAvaliacoes = dto.questoes.map((questaoDto) => {
          const questaoAvaliacao = new QuestoesAvaliacoesModel();
          questaoAvaliacao.questaoId = questaoDto.questaoId;
          questaoAvaliacao.avaliacaoId = id;
          questaoAvaliacao.ordem = questaoDto.ordem;
          questaoAvaliacao.pontuacao = questaoDto.pontuacao;
          return questaoAvaliacao;
        });

        await manager.save(questoesAvaliacoes);
      }

      await manager.delete(ArquivosAvaliacoesModel, { avaliacaoId: id });
      if (dto.arquivos && dto.arquivos.length > 0) {
        const arquivosAvaliacoes = dto.arquivos.map((arquivoDto) => {
          const arquivoAvaliacao = new ArquivosAvaliacoesModel();
          arquivoAvaliacao.arquivoId = arquivoDto.arquivoId;
          arquivoAvaliacao.avaliacaoId = id;
          arquivoAvaliacao.permitirConsultaPorEstudante =
            arquivoDto.permitirConsultaPorEstudante;
          return arquivoAvaliacao;
        });

        await manager.save(arquivosAvaliacoes);
      }

      return avaliacao.id;
    });
  }

  private async _clearOldConfigurations(
    manager: EntityManager,
    avaliacao: AvaliacaoModel,
  ): Promise<void> {
    if (avaliacao.configuracaoAvaliacao) {
      const configGeraisId =
        avaliacao.configuracaoAvaliacao.configuracoesGerais?.id;
      const configSegurancaId =
        avaliacao.configuracaoAvaliacao.configuracoesSeguranca?.id;

      if (configGeraisId) {
        const configuracoesRandomizacao = await manager.find(
          ConfiguracoesRandomizacaoModel,
          {
            where: { configuracoesGerais: { id: configGeraisId } },
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
          configuracoesGerais: { id: configGeraisId },
        });
      }

      if (configSegurancaId) {
        await manager.delete(PunicaoPorOcorrenciaModel, {
          configuracoesSegurancaId: configSegurancaId,
        });
        await manager.delete(IpsPermitidosModel, {
          configuracoesSegurancaId: configSegurancaId,
        });
        await manager.delete(ConfiguracaoNotificacaoModel, {
          configuracoesSegurancaId: configSegurancaId,
        });
      }

      await manager.update(
        AvaliacaoModel,
        {
          id: avaliacao.id,
        },
        {
          configuracaoAvaliacao: null,
        },
      );

      const configuracaoAvaliacaoId = avaliacao.configuracaoAvaliacao.id;
      await manager.delete(ConfiguracaoAvaliacaoModel, {
        id: configuracaoAvaliacaoId,
      });

      if (configGeraisId) {
        await manager.delete(ConfiguracoesGeraisModel, { id: configGeraisId });
      }
      if (configSegurancaId) {
        await manager.delete(ConfiguracoesSegurancaModel, {
          id: configSegurancaId,
        });
      }
    }
  }

  private async _createConfigurations(
    manager: EntityManager,
    dto: CreateAvaliacaoDto,
  ): Promise<ConfiguracaoAvaliacaoModel> {
    const configuracoesGerais = new ConfiguracoesGeraisModel();
    const { configuracoesRandomizacao, ...configGeraisFields } =
      dto.configuracoesAvaliacao.configuracoesGerais;
    Object.assign(configuracoesGerais, configGeraisFields);

    const savedConfigGerais = await manager.save(configuracoesGerais);

    if (configuracoesRandomizacao && configuracoesRandomizacao.length > 0) {
      for (const randomizacaoDto of configuracoesRandomizacao) {
        const configuracaoRandomizacao = new ConfiguracoesRandomizacaoModel();
        configuracaoRandomizacao.tipo = randomizacaoDto.tipo;
        configuracaoRandomizacao.dificuldade = randomizacaoDto.dificuldade;
        configuracaoRandomizacao.quantidade = randomizacaoDto.quantidade;
        configuracaoRandomizacao.configuracoesGerais = savedConfigGerais;

        const savedConfigRandomizacao = await manager.save(
          configuracaoRandomizacao,
        );

        if (randomizacaoDto.questoes && randomizacaoDto.questoes.length > 0) {
          const questoes = await manager.find(QuestaoModel, {
            where: { id: In(randomizacaoDto.questoes) },
          });
          savedConfigRandomizacao.poolDeQuestoes = questoes;
          await manager.save(savedConfigRandomizacao);
        }
      }
    }

    const configuracoesSeguranca = new ConfiguracoesSegurancaModel();

    const { punicoes, ipsPermitidos, notificacoes, ...configSegurancaFields } =
      dto.configuracoesAvaliacao.configuracoesSeguranca;

    Object.assign(configuracoesSeguranca, configSegurancaFields);

    const savedConfigSeguranca = await manager.save(configuracoesSeguranca);

    if (punicoes && punicoes.length > 0) {
      const punicoesEntities = punicoes.map((punicaoDto) => {
        const punicao = new PunicaoPorOcorrenciaModel();
        Object.assign(punicao, punicaoDto);
        punicao.configuracaoSeguranca = savedConfigSeguranca;
        return punicao;
      });

      await manager.save(punicoesEntities);
    }

    if (ipsPermitidos && ipsPermitidos.length > 0) {
      const ipsPermitidosEntities = ipsPermitidos.map((ip) => {
        const ipPermitido = new IpsPermitidosModel();
        ipPermitido.ip = ip;
        ipPermitido.configuracaoSeguranca = savedConfigSeguranca;
        return ipPermitido;
      });

      await manager.save(ipsPermitidosEntities);
    }

    if (notificacoes && notificacoes.length > 0) {
      const notificacoesEntities = notificacoes.map((tipoNotificacao) => {
        const notificacao = new ConfiguracaoNotificacaoModel();
        notificacao.tipoNotificacao = tipoNotificacao;
        notificacao.configuracaoSeguranca = savedConfigSeguranca;
        return notificacao;
      });

      await manager.save(notificacoesEntities);
    }

    const configuracaoAvaliacao = new ConfiguracaoAvaliacaoModel();

    configuracaoAvaliacao.configuracoesGerais = savedConfigGerais;
    configuracaoAvaliacao.configuracoesSeguranca = savedConfigSeguranca;

    const savedConfiguracaoAvaliacao = await manager.save(
      configuracaoAvaliacao,
    );

    await manager.save(savedConfigGerais);
    await manager.save(savedConfigSeguranca);

    return savedConfiguracaoAvaliacao;
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<AvaliacaoModel[]> {
    return this.find({
      where: {
        item: {
          tipo: TipoItemEnum.AVALIACAO,
          avaliador: { id: avaliadorId },
          pai: pastaId === null ? IsNull() : { id: pastaId },
        },
      },
      relations: ['item'],
    });
  }
}
