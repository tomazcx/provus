import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { AlternativaModel } from '../config/models/alternativa.model';
import { InjectRepository } from '@nestjs/typeorm';
import { BancoDeConteudoModel } from '../config/models/banco-de-conteudo.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { AplicacaoModel } from '../config/models/aplicacao.model';

@Injectable()
export class AvaliacaoRepository extends Repository<AvaliacaoModel> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BancoDeConteudoModel)
    private readonly bancoDeConteudoRepository: Repository<BancoDeConteudoModel>,
  ) {
    super(AvaliacaoModel, dataSource.createEntityManager());
  }

  async createAvaliacao(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      let paiParaSalvar: { id: number } | null = null;
      if (dto.paiId) {
        const pastaPai = await manager.findOne(ItemSistemaArquivosModel, {
          where: {
            id: dto.paiId,
            tipo: TipoItemEnum.PASTA,
            avaliador: { id: avaliador.id },
          },
        });
        if (!pastaPai)
          throw new BadRequestException(
            `Pasta pai com ID ${dto.paiId} não encontrada ou inválida.`,
          );
        paiParaSalvar = { id: dto.paiId };
      } else {
        const banco = await this.bancoDeConteudoRepository.findOne({
          where: {
            avaliadorId: avaliador.id,
            tipoBanco: TipoBancoEnum.AVALIACOES,
          },
          relations: ['pastaRaiz'],
        });
        if (banco?.pastaRaiz) {
          paiParaSalvar = { id: banco.pastaRaiz.id };
        }
      }

      const itemSistemaArquivos = manager.create(ItemSistemaArquivosModel, {
        titulo: dto.titulo,
        tipo: TipoItemEnum.AVALIACAO,
        avaliador: avaliador,
        pai: paiParaSalvar,
      });
      await manager.save(itemSistemaArquivos);

      const savedConfiguracaoAvaliacao = await this._createConfigurations(
        manager,
        dto,
      );

      const avaliacao = manager.create(AvaliacaoModel, {
        id: itemSistemaArquivos.id,
        item: itemSistemaArquivos,
        descricao: dto.descricao,
        isModelo: dto.isModelo,
        configuracaoAvaliacao: savedConfiguracaoAvaliacao,
      });
      await manager.save(avaliacao);

      if (dto.questoes && dto.questoes.length > 0) {
        for (const questaoDto of dto.questoes) {
          let questaoIdParaLinkar: number;

          if (questaoDto.questaoId) {
            questaoIdParaLinkar = questaoDto.questaoId;
            const questaoExistente = await manager.findOne(QuestaoModel, {
              where: {
                id: questaoIdParaLinkar,
                item: { avaliador: { id: avaliador.id } },
              },
            });
            if (!questaoExistente) {
              throw new BadRequestException(
                `Questão com ID ${questaoIdParaLinkar} não encontrada ou não pertence a você.`,
              );
            }
          } else {
            if (
              !questaoDto.titulo ||
              !questaoDto.tipoQuestao ||
              !questaoDto.dificuldade
            ) {
              throw new BadRequestException(
                'Para criar uma nova questão, título, tipo e dificuldade são obrigatórios.',
              );
            }
            const novoItemQuestao = manager.create(ItemSistemaArquivosModel, {
              titulo: questaoDto.titulo,
              tipo: TipoItemEnum.QUESTAO,
              avaliador: avaliador,
              // pai: { id: ID_PASTA_RAIZ_QUESTOES }, // Definir onde salvar
            });
            await manager.save(novoItemQuestao);
            const novaQuestao = manager.create(QuestaoModel, {
              id: novoItemQuestao.id,
              item: novoItemQuestao,
              dificuldade: questaoDto.dificuldade,
              tipoQuestao: questaoDto.tipoQuestao,
              descricao: questaoDto.descricao,
              isModelo: false,
              exemploRespostaIa: questaoDto.exemploRespostaIa,
              textoRevisao: questaoDto.textoRevisao,
              pontuacao: questaoDto.pontuacao ?? 0,
              alternativas: [],
            });
            await manager.save(novaQuestao);

            if (questaoDto.alternativas && questaoDto.alternativas.length > 0) {
              const alternativaRepo = manager.getRepository(AlternativaModel);
              const novasAlternativas = questaoDto.alternativas.map((altDto) =>
                alternativaRepo.create({ ...altDto, questao: novaQuestao }),
              );
              await alternativaRepo.save(novasAlternativas);
            }
            questaoIdParaLinkar = novaQuestao.id;
          }

          const questaoAvaliacao = manager.create(QuestoesAvaliacoesModel, {
            avaliacaoId: avaliacao.id,
            questaoId: questaoIdParaLinkar,
            ordem: questaoDto.ordem,
            pontuacao: questaoDto.pontuacao,
          });
          await manager.save(questaoAvaliacao);
        }
      }

      if (dto.arquivos && dto.arquivos.length > 0) {
        const arquivosAvaliacoes = dto.arquivos.map((arquivoDto) =>
          manager.create(ArquivosAvaliacoesModel, {
            arquivoId: arquivoDto.arquivoId,
            avaliacaoId: avaliacao.id,
            permitirConsultaPorEstudante:
              arquivoDto.permitirConsultaPorEstudante,
          }),
        );
        await manager.save(arquivosAvaliacoes);
      }

      return avaliacao.id;
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
          'configuracaoAvaliacao.configuracoesSeguranca',
        ],
      });
      if (!avaliacao) {
        throw new NotFoundException(`Avaliação com ID ${id} não encontrada.`);
      }

      avaliacao.item.titulo = dto.titulo;
      await manager.save(avaliacao.item);
      avaliacao.descricao = dto.descricao;
      avaliacao.isModelo = dto.isModelo;

      await this._clearOldConfigurations(manager, avaliacao);
      avaliacao.configuracaoAvaliacao = await this._createConfigurations(
        manager,
        dto,
      );
      await manager.save(avaliacao);

      await manager.delete(QuestoesAvaliacoesModel, { avaliacaoId: id });
      await manager.delete(AplicacaoModel, { avaliacao: { id } });
      await manager.delete(ArquivosAvaliacoesModel, { avaliacaoId: id });

      if (dto.questoes && dto.questoes.length > 0) {
        for (const questaoDto of dto.questoes) {
          let questaoIdParaLinkar: number;

          if (questaoDto.questaoId !== undefined) {
            questaoIdParaLinkar = questaoDto.questaoId;
            const questaoOriginal = await manager.findOne(QuestaoModel, {
              where: {
                id: questaoIdParaLinkar,
                item: { avaliador: { id: avaliador.id } },
              },
            });
            if (!questaoOriginal) {
              throw new BadRequestException(
                `Questão original ${questaoIdParaLinkar} não encontrada.`,
              );
            }
          } else {
            if (
              !questaoDto.titulo ||
              !questaoDto.tipoQuestao ||
              !questaoDto.dificuldade
            ) {
              throw new BadRequestException(
                'Para criar instância (nova/modificada), título, tipo e dificuldade são obrigatórios.',
              );
            }
            const novoItemQuestao = manager.create(ItemSistemaArquivosModel, {
              titulo: questaoDto.titulo,
              tipo: TipoItemEnum.QUESTAO,
              avaliador: avaliador,
              // pai: { id: ID_PASTA_RAIZ_QUESTOES },
            });
            await manager.save(novoItemQuestao);
            const novaQuestao = manager.create(QuestaoModel, {
              id: novoItemQuestao.id,
              item: novoItemQuestao,
              dificuldade: questaoDto.dificuldade,
              tipoQuestao: questaoDto.tipoQuestao,
              descricao: questaoDto.descricao,
              isModelo: false,
              exemploRespostaIa: questaoDto.exemploRespostaIa,
              textoRevisao: questaoDto.textoRevisao,
              pontuacao: questaoDto.pontuacao ?? 0,
              alternativas: [],
            });
            await manager.save(novaQuestao);

            if (questaoDto.alternativas && questaoDto.alternativas.length > 0) {
              const alternativaRepo = manager.getRepository(AlternativaModel);
              const novasAlternativas = questaoDto.alternativas.map((altDto) =>
                alternativaRepo.create({ ...altDto, questao: novaQuestao }),
              );
              await alternativaRepo.save(novasAlternativas);
            }
            questaoIdParaLinkar = novaQuestao.id;
          }

          const questaoAvaliacao = manager.create(QuestoesAvaliacoesModel, {
            avaliacaoId: id,
            questaoId: questaoIdParaLinkar,
            ordem: questaoDto.ordem,
            pontuacao: questaoDto.pontuacao,
          });
          await manager.save(questaoAvaliacao);
        }
      }

      if (dto.arquivos && dto.arquivos.length > 0) {
        const arquivosAvaliacoes = dto.arquivos.map((arquivoDto) =>
          manager.create(ArquivosAvaliacoesModel, {
            arquivoId: arquivoDto.arquivoId,
            avaliacaoId: id,

            permitirConsultaPorEstudante:
              arquivoDto.permitirConsultaPorEstudante,
          }),
        );
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
