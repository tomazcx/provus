import { BadRequestException } from '@nestjs/common';
import { EntityManager, DataSource, In, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AplicacaoRepository } from 'src/database/repositories/aplicacao.repository';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import {
  AplicacaoDto,
  AplicacaoStatsDto,
  AplicacaoViolationDto,
} from 'src/dto/result/aplicacao/aplicacao.dto';
import {
  FindAllAplicacaoDto,
  FindAllAplicacaoDtoFactory,
} from 'src/dto/result/aplicacao/find-all-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import TipoAtividadeEnum from 'src/enums/tipo-atividade.enum';
import { MonitoramentoInicialResponseDto } from 'src/http/controllers/backoffice/aplicacao/get-monitoramento-inicial/response';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { RegistroPunicaoPorOcorrenciaModel } from 'src/database/config/models/registro-punicao-por-ocorrencia.model';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { AvaliacaoDto } from 'src/dto/result/avaliacao/avaliacao.dto';

@Injectable()
export class AplicacaoService {
  constructor(
    private readonly aplicacaoRepository: AplicacaoRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,
    @InjectRepository(RegistroPunicaoPorOcorrenciaModel)
    private readonly registroPunicaoRepository: Repository<RegistroPunicaoPorOcorrenciaModel>,
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'avaliacao.arquivos',
        'avaliacao.arquivos.arquivo',
        'avaliacao.arquivos.arquivo.item',
        'avaliacao.questoes',
        'avaliacao.questoes.questao',
        'avaliacao.questoes.questao.item',
        'avaliacao.questoes.questao.alternativas',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.item',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    const pontuacaoTotalAvaliacao =
      aplicacao.avaliacao.questoes?.reduce(
        (sum, qa) => sum + Number(qa.pontuacao || 0),
        0,
      ) ?? 0;

    const finalStates = [
      EstadoSubmissaoEnum.ENVIADA,
      EstadoSubmissaoEnum.AVALIADA,
      EstadoSubmissaoEnum.ENCERRADA,
    ];

    const statsQuery = this.submissaoRepository
      .createQueryBuilder('submissao')
      .select('COUNT(*)', 'totalSubmissoes')
      .addSelect(
        `COUNT(CASE WHEN submissao.estado IN (:...finalStates) THEN 1 END)`,
        'submissoesFinalizadas',
      )
      .addSelect(
        "AVG(CAST(NULLIF(submissao.pontuacao_total::text, 'NaN') AS numeric))",
        'mediaPontuacaoBruta',
      )
      .addSelect(
        "MAX(CAST(NULLIF(submissao.pontuacao_total::text, 'NaN') AS numeric))",
        'maiorPontuacaoBruta',
      )
      .addSelect(
        "MIN(CAST(NULLIF(submissao.pontuacao_total::text, 'NaN') AS numeric))",
        'menorPontuacaoBruta',
      )
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (submissao.finalizado_em - submissao.criado_em)))',
        'tempoMedioSegundos',
      )
      .where('submissao.aplicacao_id = :aplicacaoId', { aplicacaoId: id })
      .setParameters({
        aplicacaoId: id,
        finalStates: finalStates,
      });

    const rawStats = await statsQuery.getRawOne<{
      totalSubmissoes: string;
      submissoesFinalizadas: string;
      mediaPontuacaoBruta: string | null;
      maiorPontuacaoBruta: string | null;
      menorNotaPercentual: string | null;
      tempoMedioSegundos: string | null;
    }>();

    const scoresQuery = this.submissaoRepository
      .createQueryBuilder('submissao')
      .select('CAST(submissao.pontuacao_total AS numeric)', 'score')
      .where('submissao.aplicacao_id = :aplicacaoId', { aplicacaoId: id })
      .andWhere('submissao.estado IN (:...finalStates)', {
        finalStates: finalStates,
      })
      .andWhere(
        "submissao.pontuacao_total IS NOT NULL AND submissao.pontuacao_total::text != 'NaN'",
      );

    const rawScores = await scoresQuery.getRawMany<{ score: string }>();
    const finalScores = rawScores
      .map((s) => parseFloat(s.score))
      .filter((s) => !isNaN(s));

    const stats: AplicacaoStatsDto = {
      totalSubmissoes: 0,
      submissoesFinalizadas: 0,
      taxaDeConclusaoPercentual: 0,
      mediaGeralPercentual: null,
      maiorNotaPercentual: null,
      menorNotaPercentual: null,
      tempoMedioMinutos: null,
      pontuacaoTotalAvaliacao: pontuacaoTotalAvaliacao,
      finalScores: finalScores,
    };

    if (rawStats && parseInt(rawStats.totalSubmissoes, 10) > 0) {
      const total = parseInt(rawStats.totalSubmissoes, 10);
      const finalizadas = parseInt(rawStats.submissoesFinalizadas, 10);
      const mediaBruta = rawStats.mediaPontuacaoBruta
        ? parseFloat(rawStats.mediaPontuacaoBruta)
        : null;
      const maiorBruta = rawStats.maiorPontuacaoBruta
        ? parseFloat(rawStats.maiorPontuacaoBruta)
        : null;
      const menorBruta = rawStats.menorNotaPercentual
        ? parseFloat(rawStats.menorNotaPercentual)
        : null;
      const tempoMedioS = rawStats.tempoMedioSegundos
        ? parseFloat(rawStats.tempoMedioSegundos)
        : null;

      stats.totalSubmissoes = total;
      stats.submissoesFinalizadas = finalizadas;
      stats.taxaDeConclusaoPercentual =
        total > 0 ? Math.round((finalizadas / total) * 100) : 0;

      stats.mediaGeralPercentual =
        mediaBruta !== null && pontuacaoTotalAvaliacao > 0
          ? Math.round((mediaBruta / pontuacaoTotalAvaliacao) * 100)
          : null;

      stats.maiorNotaPercentual =
        maiorBruta !== null && pontuacaoTotalAvaliacao > 0
          ? Math.round((maiorBruta / pontuacaoTotalAvaliacao) * 100)
          : null;

      stats.menorNotaPercentual =
        menorBruta !== null && pontuacaoTotalAvaliacao > 0
          ? Math.round((menorBruta / pontuacaoTotalAvaliacao) * 100)
          : null;

      stats.tempoMedioMinutos =
        tempoMedioS !== null ? Math.round(tempoMedioS / 60) : null;
    }

    const violationsRaw = await this.registroPunicaoRepository
      .createQueryBuilder('registro')
      .innerJoin('registro.submissao', 'submissao')
      .innerJoin('submissao.estudante', 'estudante')
      .select([
        'registro.id as id',
        'registro.tipo_infracao as "tipoInfracao"',
        'registro.criado_em as timestamp',
        'estudante.nome as "estudanteNome"',
        'estudante.email as "estudanteEmail"',
      ])
      .where('submissao.aplicacao_id = :aplicacaoId', { aplicacaoId: id })
      .orderBy('registro.criado_em', 'DESC')
      .getRawMany<
        Omit<AplicacaoViolationDto, 'timestamp'> & { timestamp: Date }
      >();

    const violations: AplicacaoViolationDto[] = violationsRaw.map((v) => ({
      ...v,
      timestamp: v.timestamp.toISOString(),
    }));

    const avaliacaoPath = await this.itemSistemaArquivosRepository.findPathById(
      aplicacao.avaliacao.id,
    );
    const avaliacaoDto = new AvaliacaoDto(aplicacao.avaliacao, avaliacaoPath);

    return new AplicacaoDto(aplicacao, avaliacaoDto, stats, violations);
  }

  async findByCode(codigoAcesso: string): Promise<AplicacaoModel> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { codigoAcesso },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'avaliacao.questoes',
        'avaliacao.arquivos',
        'avaliacao.arquivos.arquivo',
        'avaliacao.arquivos.arquivo.item',
        'avaliacao.questoes.questao',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    return aplicacao;
  }

  async findAll(avaliadorId: number): Promise<FindAllAplicacaoDto[]> {
    const aplicacoes = await this.aplicacaoRepository.find({
      where: {
        avaliacao: {
          item: {
            avaliador: { id: avaliadorId },
          },
        },
      },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'avaliacao.questoes',
        'avaliacao.arquivos',
        'avaliacao.arquivos.arquivo',
        'avaliacao.arquivos.arquivo.item',
        'avaliacao.questoes.questao',
        'avaliacao.questoes.questao.item',
        'avaliacao.questoes.questao.alternativas',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
      ],
      order: {
        dataInicio: 'DESC',
      },
    });

    if (aplicacoes.length === 0) {
      return [];
    }

    const aplicacaoIds = aplicacoes.map((app) => app.id);

    const statsRaw = await this.submissaoRepository
      .createQueryBuilder('submissao')
      .select('submissao.aplicacao_id', 'aplicacaoId')
      .addSelect('COUNT(submissao.id)::int', 'totalSubmissoes')
      .addSelect('AVG(submissao.pontuacao_total)::float', 'mediaPontuacaoBruta')
      .where('submissao.aplicacao_id IN (:...aplicacaoIds)', { aplicacaoIds })
      .groupBy('submissao.aplicacao_id')
      .getRawMany<{
        aplicacaoId: number;
        totalSubmissoes: number;
        mediaPontuacaoBruta: number | null;
      }>();

    const statsMap = new Map<
      number,
      { totalSubmissoes: number; mediaPontuacaoBruta: number | null }
    >();
    statsRaw.forEach((stat) => {
      statsMap.set(stat.aplicacaoId, {
        totalSubmissoes: stat.totalSubmissoes,
        mediaPontuacaoBruta: stat.mediaPontuacaoBruta,
      });
    });

    const dtosPromises = aplicacoes.map(async (aplicacao) => {
      const appStats = statsMap.get(aplicacao.id) ?? {
        totalSubmissoes: 0,
        mediaPontuacaoBruta: null,
      };

      const pontuacaoTotalAvaliacao =
        aplicacao.avaliacao.questoes?.reduce(
          (sum, qa) => sum + Number(qa.pontuacao || 0),
          0,
        ) ?? 0;

      let mediaPercentual: number | null = null;
      if (
        appStats.mediaPontuacaoBruta !== null &&
        pontuacaoTotalAvaliacao > 0
      ) {
        mediaPercentual = Math.round(
          (appStats.mediaPontuacaoBruta / pontuacaoTotalAvaliacao) * 100,
        );
      }

      return FindAllAplicacaoDtoFactory.create(
        aplicacao,
        {
          totalSubmissoes: appStats.totalSubmissoes,
          mediaGeralPercentual: mediaPercentual,
        },
        this.itemSistemaArquivosRepository,
      );
    });

    return Promise.all(dtosPromises);
  }
  async createAplicacao(
    dto: CreateAplicacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    return this.dataSource.transaction(async (manager) => {
      const codigoAcesso = await this.generateUniqueAccessCode(manager);

      const aplicacaoId = await this.aplicacaoRepository.createAplicacao(
        dto,
        codigoAcesso,
        avaliador,
      );

      return this.findById(aplicacaoId, avaliador);
    });
  }

  async update(
    id: number,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    const aplicacaoId = await this.aplicacaoRepository.updateAplicacao(
      id,
      aplicacao.avaliacao,
      estado,
      avaliador,
    );

    return this.findById(aplicacaoId, avaliador);
  }

  async delete(id: number, avaliador: AvaliadorModel): Promise<void> {
    await this.aplicacaoRepository.deleteAplicacao(id, avaliador);
  }

  private async generateUniqueAccessCode(
    manager: EntityManager,
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    const activeStates = [
      EstadoAplicacaoEnum.CRIADA,
      EstadoAplicacaoEnum.EM_ANDAMENTO,
      EstadoAplicacaoEnum.AGENDADA,
      EstadoAplicacaoEnum.PAUSADA,
    ];

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const existingAplicacao = await manager.findOne(AplicacaoModel, {
        where: { codigoAcesso: code, estado: In(activeStates) },
      });

      if (!existingAplicacao) {
        return code;
      }

      attempts++;
    }

    throw new BadRequestException(
      'Não foi possível gerar um código de acesso único após várias tentativas',
    );
  }

  async getMonitoramentoInicialData(
    aplicacaoId: number,
    avaliadorId: number,
  ): Promise<MonitoramentoInicialResponseDto | null> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: {
        id: aplicacaoId,
        avaliacao: { item: { avaliador: { id: avaliadorId } } },
      },
      relations: ['avaliacao', 'avaliacao.questoes'],
    });

    if (!aplicacao) {
      return null;
    }

    const estadosRelevantes = [
      EstadoSubmissaoEnum.INICIADA,
      EstadoSubmissaoEnum.PAUSADA,
      EstadoSubmissaoEnum.REABERTA,
      EstadoSubmissaoEnum.ENCERRADA,
    ];

    const submissoes = await this.submissaoRepository.find({
      where: {
        aplicacao: { id: aplicacaoId },
        estado: In(estadosRelevantes),
      },
      relations: ['estudante', 'respostas'],
      order: {
        criadoEm: 'ASC',
      },
    });

    const registrosPunicao = await this.registroPunicaoRepository.find({
      where: {
        submissao: { aplicacao: { id: aplicacaoId } },
      },
      relations: ['submissao', 'submissao.estudante'],
      order: { criadoEm: 'DESC' },
      take: 50,
    });

    const totalQuestoesAplicacao = aplicacao.avaliacao?.questoes?.length ?? 0;

    const alunosProgresso = await Promise.all(
      submissoes.map((sub) => {
        const questoesRespondidas =
          sub.respostas?.filter(
            (r) =>
              r.dadosResposta !== null &&
              ((typeof r.dadosResposta === 'object' &&
                'texto' in r.dadosResposta &&
                (r.dadosResposta as { texto: string }).texto?.trim() !== '') ||
                (typeof r.dadosResposta === 'object' &&
                  'alternativa_id' in r.dadosResposta &&
                  (r.dadosResposta as { alternativa_id: number | null })
                    .alternativa_id !== null) ||
                (typeof r.dadosResposta === 'object' &&
                  'alternativas_id' in r.dadosResposta &&
                  Array.isArray(
                    (r.dadosResposta as { alternativas_id: number[] })
                      .alternativas_id,
                  ) &&
                  (r.dadosResposta as { alternativas_id: number[] })
                    .alternativas_id.length > 0)),
          ).length ?? 0;

        const progresso =
          totalQuestoesAplicacao > 0
            ? Math.round((questoesRespondidas / totalQuestoesAplicacao) * 100)
            : 0;

        const alertasCount = registrosPunicao.filter(
          (rp) => rp.submissao.id === sub.id,
        ).length;

        return {
          submissaoId: sub.id,
          aluno: {
            nome: sub.estudante?.nome ?? 'Aluno Desconhecido',
            email: sub.estudante?.email ?? 'Email Desconhecido',
          },
          estado: sub.estado,
          progresso: progresso,
          questoesRespondidas: questoesRespondidas,
          totalQuestoes: totalQuestoesAplicacao,
          horaInicio: sub.criadoEm.toISOString(),
          alertas: alertasCount,
          tempoPenalidadeEmSegundos: 0,
        };
      }),
    );

    const atividadesRecentes = registrosPunicao.map((rp) => ({
      id: rp.id,
      tipo: TipoAtividadeEnum.PENALIDADE,
      alunoNome: rp.submissao?.estudante?.nome ?? 'Aluno Desconhecido',
      descricao: `recebeu um alerta por ${rp.tipoInfracao}.`,
      timestamp: rp.criadoEm.toISOString(),
    }));

    return {
      alunos: alunosProgresso,
      atividadesRecentes: atividadesRecentes,
    };
  }

  async ajustarTempoAplicacao(
    aplicacaoId: number,
    segundosParaAdicionar: number,
    avaliadorId: number,
  ): Promise<AplicacaoModel> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: {
        id: aplicacaoId,
        avaliacao: { item: { avaliador: { id: avaliadorId } } },
        estado: In([
          EstadoAplicacaoEnum.EM_ANDAMENTO,
          EstadoAplicacaoEnum.PAUSADA,
        ]),
      },
    });

    if (!aplicacao) {
      throw new NotFoundException(
        `Aplicação ${aplicacaoId} não encontrada, não pertence ao avaliador ou não está em um estado que permita ajuste de tempo (${EstadoAplicacaoEnum.EM_ANDAMENTO} ou ${EstadoAplicacaoEnum.PAUSADA}).`,
      );
    }

    if (!aplicacao.dataFim) {
      throw new BadRequestException(
        `Aplicação ${aplicacaoId} não possui uma data de fim definida para ajuste.`,
      );
    }

    const novaDataFim = new Date(
      aplicacao.dataFim.getTime() + segundosParaAdicionar * 1000,
    );
    const agora = new Date();

    if (novaDataFim.getTime() <= agora.getTime() + 5000) {
      throw new BadRequestException(
        'Não é possível ajustar o tempo final para o passado ou muito próximo do momento atual.',
      );
    }

    aplicacao.dataFim = novaDataFim;
    await this.aplicacaoRepository.save(aplicacao);

    return aplicacao;
  }

  async reiniciarTimerAplicacao(
    aplicacaoId: number,
    avaliadorId: number,
  ): Promise<AplicacaoModel> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: {
        id: aplicacaoId,
        avaliacao: { item: { avaliador: { id: avaliadorId } } },
        estado: In([
          EstadoAplicacaoEnum.EM_ANDAMENTO,
          EstadoAplicacaoEnum.PAUSADA,
        ]),
      },
      relations: [
        'avaliacao',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException(
        `Aplicação ${aplicacaoId} não encontrada, não pertence ao avaliador ou não está em estado ${EstadoAplicacaoEnum.EM_ANDAMENTO} ou ${EstadoAplicacaoEnum.PAUSADA}.`,
      );
    }

    const tempoMaximoOriginal =
      aplicacao.avaliacao?.configuracaoAvaliacao?.configuracoesGerais
        ?.tempoMaximo;
    if (
      tempoMaximoOriginal === undefined ||
      tempoMaximoOriginal === null ||
      tempoMaximoOriginal <= 0
    ) {
      throw new BadRequestException(
        `A avaliação associada à aplicação ${aplicacaoId} não possui um tempo máximo válido definido.`,
      );
    }

    const agora = new Date();
    const novaDataFim = new Date(
      agora.getTime() + tempoMaximoOriginal * 60 * 1000,
    );

    aplicacao.dataInicio = agora;
    aplicacao.dataFim = novaDataFim;

    aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;

    await this.aplicacaoRepository.save(aplicacao);

    return aplicacao;
  }
}
