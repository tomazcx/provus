import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, In } from 'typeorm';
import * as crypto from 'crypto';

import { CreateSubmissaoRequest } from 'src/http/controllers/backoffice/submissao/create-submissao/request';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { SubmissaoResultDto } from 'src/dto/result/submissao/submissao.result';
import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import { SubmissaoRespostasModel } from 'src/database/config/models/submissao-respostas.model';
import { NotificationProvider } from 'src/providers/notification.provider';
import { EmailTemplatesProvider } from 'src/providers/email-templates.provider';
import { Env } from 'src/shared/env';
import { EstudanteModel } from 'src/database/config/models/estudante.model';
import { SubmissaoQuestoesResultDto } from 'src/dto/result/submissao/submissao-questoes.result';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import { ProcessPunicaoPorCorrenciaDto } from 'src/dto/request/submissao/process-punicao-por-correncia.dto';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import { SubmitRespostaRequest } from 'src/http/models/request/submit-respostas.request';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { DadosRespostaType } from 'src/shared/types/dados-resposta.type';
import {
  isDadosRespostaObjetiva,
  isDadosRespostaMultipla,
} from 'src/shared/guards/dados-resposta.guard';
import { SubmissaoRevisaoResultDto } from 'src/dto/result/revisao/submissao-revisao.result.dto';
@Injectable()
export class SubmissaoService {
  private readonly logger = new Logger(SubmissaoService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly emailTemplatesProvider: EmailTemplatesProvider,
    private readonly notificationProvider: NotificationProvider,

    @InjectRepository(AplicacaoModel)
    private readonly aplicacaoRepository: Repository<AplicacaoModel>,

    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,

    @InjectRepository(SubmissaoRespostasModel)
    private readonly submissaoRespostasRepository: Repository<SubmissaoRespostasModel>,

    @InjectRepository(EstudanteModel)
    private readonly estudanteRepository: Repository<EstudanteModel>,

    @InjectRepository(QuestaoModel)
    private readonly questaoRepository: Repository<QuestaoModel>,
  ) {}

  async createSubmissao(
    body: CreateSubmissaoRequest,
  ): Promise<SubmissaoResultDto> {
    try {
      const aplicacao = await this.aplicacaoRepository.findOne({
        where: {
          codigoAcesso: body.codigoAcesso,
          estado: EstadoAplicacaoEnum.EM_ANDAMENTO,
        },
        relations: [
          'avaliacao',
          'avaliacao.item',
          'avaliacao.questoes',
          'avaliacao.questoes.questao',
          'avaliacao.configuracaoAvaliacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        ],
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      const submissaoSalva = await this.dataSource.transaction(
        async (manager) => {
          const estudanteExists = await this.estudanteRepository.findOne({
            where: {
              email: body.email,
              submissao: { aplicacao: { id: aplicacao.id } },
            },
          });

          if (estudanteExists) {
            throw new BadRequestException(
              'Email já utilizado para essa avaliacao',
            );
          }

          const estudante = this.estudanteRepository.create({
            nome: body.nome,
            email: body.email,
          });

          const codigoEntrega =
            await this._generateUniqueSubmissionCode(manager);
          const hash = this._createShortHash(
            body.codigoAcesso + estudante.email,
          );

          const questoes = await this._randomizeQuestoes(aplicacao.avaliacao);

          const novaSubmissao = this.submissaoRepository.create({
            aplicacao: aplicacao,
            codigoEntrega: codigoEntrega,
            estudante: estudante,
            hash: hash,
            estado: EstadoSubmissaoEnum.INICIADA,
            pontuacaoTotal: 0,
          });

          const submissaoSalva = await manager.save(novaSubmissao);

          for (const [index, questao] of questoes.entries()) {
            const submissaoResposta = this.submissaoRespostasRepository.create({
              submissaoId: submissaoSalva.id,
              questaoId: questao.id,
              dadosResposta: {},
              pontuacao: 0,
              ordem: index + 1,
            });

            await manager.save(submissaoResposta);
          }

          return submissaoSalva;
        },
      );

      const url = `${Env.FRONTEND_URL}/submissao/${submissaoSalva.hash}`;
      const html = this.emailTemplatesProvider.submissaoCriada(
        url,
        aplicacao.avaliacao.item.titulo,
      );

      await this.notificationProvider.sendEmail(
        submissaoSalva.estudante.email,
        'Provus - Avaliação iniciada',
        html,
      );

      return new SubmissaoResultDto(submissaoSalva);
    } catch (error) {
      console.log('Falha ao criar a submissão', error);
      throw error;
    }
  }

  async submitAnswers(
    hash: string,
    respostasDto: SubmitRespostaRequest[],
  ): Promise<SubmissaoResultDto> {
    const submissao = await this.submissaoRepository.findOne({
      where: { hash },
      relations: [
        'respostas',
        'aplicacao',
        'respostas.questao',
        'respostas.questao.alternativas',
      ],
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada.');
    }

    const estadosPermitidosParaEnvio = [
      EstadoSubmissaoEnum.INICIADA,
      EstadoSubmissaoEnum.REABERTA,
    ];
    if (!estadosPermitidosParaEnvio.includes(submissao.estado)) {
      throw new BadRequestException(
        `Submissão com estado "${submissao.estado}" não pode ser enviada.`,
      );
    }

    if (
      submissao.aplicacao.dataFim &&
      new Date() > submissao.aplicacao.dataFim
    ) {
      throw new BadRequestException('O tempo para esta avaliação já expirou.');
    }

    let submissaoAtualizada: SubmissaoModel;

    await this.dataSource.transaction(async (manager) => {
      const submissaoRepo = manager.getRepository(SubmissaoModel);
      const respostasRepo = manager.getRepository(SubmissaoRespostasModel);

      const respostasExistentesMap = new Map<number, SubmissaoRespostasModel>();
      submissao.respostas.forEach((r) =>
        respostasExistentesMap.set(r.questaoId, r),
      );

      for (const respostaDto of respostasDto) {
        const respostaExistente = respostasExistentesMap.get(
          respostaDto.questaoId,
        );
        if (respostaExistente) {
          let novosDadosResposta: DadosRespostaType | null = null;
          if (
            respostaDto.texto !== undefined &&
            respostaDto.texto.trim() !== ''
          ) {
            novosDadosResposta = { texto: respostaDto.texto };
          } else if (respostaDto.alternativa_id !== undefined) {
            novosDadosResposta = { alternativa_id: respostaDto.alternativa_id };
          } else if (
            respostaDto.alternativas_id !== undefined &&
            respostaDto.alternativas_id.length > 0
          ) {
            novosDadosResposta = {
              alternativas_id: respostaDto.alternativas_id,
            };
          }
          respostaExistente.dadosResposta = novosDadosResposta;
        } else {
          this.logger.warn(
            `Recebida resposta para questão ID ${respostaDto.questaoId} que não pertence à submissão ${submissao.id}. Ignorando.`,
          );
        }
      }

      let pontuacaoTotalCalculada = 0;
      let temCorrecaoManualPendente = false;
      const respostasParaSalvar: SubmissaoRespostasModel[] = [];

      for (const resposta of submissao.respostas) {
        const questaoGabarito = resposta.questao;
        const dadosRespostaAluno = resposta.dadosResposta;

        const isAnswered =
          dadosRespostaAluno &&
          typeof dadosRespostaAluno === 'object' &&
          Object.keys(dadosRespostaAluno).length > 0;

        if (!isAnswered) {
          resposta.pontuacao = 0;
          resposta.estadoCorrecao = EstadoQuestaoCorrigida.NAO_RESPONDIDA;
          respostasParaSalvar.push(resposta);
          continue;
        }

        const pontuacaoMaximaQuestao = resposta.questao.pontuacao;
        let pontuacaoObtida = 0;
        let estadoCorrecao: EstadoQuestaoCorrigida;

        switch (questaoGabarito.tipoQuestao) {
          case TipoQuestaoEnum.OBJETIVA: {
            const alternativaCorretaObj = questaoGabarito.alternativas.find(
              (a) => a.isCorreto,
            );
            let respostaAlunoObjId: number | null = null;
            if (isDadosRespostaObjetiva(dadosRespostaAluno)) {
              respostaAlunoObjId = dadosRespostaAluno.alternativa_id;
            }

            if (
              alternativaCorretaObj &&
              respostaAlunoObjId === alternativaCorretaObj.id
            ) {
              pontuacaoObtida = pontuacaoMaximaQuestao;
              estadoCorrecao = EstadoQuestaoCorrigida.CORRETA;
            } else {
              pontuacaoObtida = 0;
              estadoCorrecao = EstadoQuestaoCorrigida.INCORRETA;
            }
            break;
          }

          case TipoQuestaoEnum.MULTIPLA_ESCOLHA:
          case TipoQuestaoEnum.VERDADEIRO_FALSO: {
            const idsCorretas = new Set(
              questaoGabarito.alternativas
                .filter((a) => a.isCorreto)
                .map((a) => a.id),
            );
            let idsAluno = new Set<number>();
            if (isDadosRespostaMultipla(dadosRespostaAluno)) {
              idsAluno = new Set(dadosRespostaAluno.alternativas_id);
            }

            const totalCorretas = idsCorretas.size;
            const acertos = [...idsAluno].filter((id) =>
              idsCorretas.has(id),
            ).length;
            const erros = [...idsAluno].filter(
              (id) => !idsCorretas.has(id),
            ).length;

            let pontuacaoCalculada = 0;
            if (totalCorretas > 0) {
              const pontosPorAcerto = pontuacaoMaximaQuestao / totalCorretas;
              const penalidadePorErro = pontosPorAcerto;
              pontuacaoCalculada =
                acertos * pontosPorAcerto - erros * penalidadePorErro;
            }
            pontuacaoObtida = Math.max(0, pontuacaoCalculada);

            if (
              pontuacaoObtida === pontuacaoMaximaQuestao &&
              erros === 0 &&
              acertos === totalCorretas &&
              idsAluno.size === totalCorretas
            ) {
              estadoCorrecao = EstadoQuestaoCorrigida.CORRETA;
            } else if (pontuacaoObtida > 0) {
              estadoCorrecao = EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA;
            } else {
              estadoCorrecao = EstadoQuestaoCorrigida.INCORRETA;
            }
            break;
          }

          case TipoQuestaoEnum.DISCURSIVA: {
            pontuacaoObtida = 0;
            estadoCorrecao = EstadoQuestaoCorrigida.PENDENTE_CORRECAO_MANUAL;
            temCorrecaoManualPendente = true;
            break;
          }

          default: {
            this.logger.warn(
              `Tipo de questão desconhecido encontrado durante a correção: ${String(questaoGabarito.tipoQuestao)}`,
            );
            pontuacaoObtida = 0;
            estadoCorrecao = EstadoQuestaoCorrigida.INCORRETA;
            break;
          }
        }

        resposta.pontuacao = parseFloat(pontuacaoObtida.toFixed(2));
        resposta.estadoCorrecao = estadoCorrecao;
        respostasParaSalvar.push(resposta);
        pontuacaoTotalCalculada += resposta.pontuacao;
      }

      if (respostasParaSalvar.length > 0) {
        await respostasRepo.save(respostasParaSalvar);
      }

      submissao.estado = temCorrecaoManualPendente
        ? EstadoSubmissaoEnum.ENVIADA
        : EstadoSubmissaoEnum.AVALIADA;
      submissao.finalizadoEm = new Date();
      submissao.pontuacaoTotal = parseFloat(pontuacaoTotalCalculada.toFixed(2));
      submissaoAtualizada = await submissaoRepo.save(submissao);
    });

    if (!submissaoAtualizada) {
      const submissaoFinal = await this.submissaoRepository.findOneOrFail({
        where: { hash },
        relations: ['estudante'],
      });
      return new SubmissaoResultDto(submissaoFinal);
    }
    if (!submissaoAtualizada.estudante) {
      const submissaoComEstudante =
        await this.submissaoRepository.findOneOrFail({
          where: { id: submissaoAtualizada.id },
          relations: ['estudante'],
        });
      return new SubmissaoResultDto(submissaoComEstudante);
    }

    return new SubmissaoResultDto(submissaoAtualizada);
  }

  private async _generateUniqueSubmissionCode(
    manager: EntityManager,
  ): Promise<number> {
    let attempts = 0;
    const maxAttempts = 10;

    const activeStates = [
      EstadoSubmissaoEnum.INICIADA,
      EstadoSubmissaoEnum.ENVIADA,
      EstadoSubmissaoEnum.REABERTA,
      EstadoSubmissaoEnum.PAUSADA,
      EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
    ];

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000);

      const existingSubmissao = await manager.findOne(SubmissaoModel, {
        where: { codigoEntrega: code, estado: In(activeStates) },
      });

      if (!existingSubmissao) {
        return code;
      }

      attempts++;
    }
    throw new BadRequestException(
      'Não foi possível gerar um código de entrega após várias tentativas',
    );
  }

  async findSubmissaoForReview(
    hash: string,
  ): Promise<SubmissaoRevisaoResultDto> {
    const submissao = await this.submissaoRepository.findOne({
      where: { hash: hash },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'aplicacao.avaliacao.arquivos',
        'aplicacao.avaliacao.arquivos.arquivo',
        'aplicacao.avaliacao.arquivos.arquivo.item',
        'respostas',
        'respostas.questao',
        'respostas.questao.item',
        'respostas.questao.alternativas',
      ],
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada.');
    }

    const permitirRevisaoConfig =
      submissao.aplicacao?.avaliacao?.configuracaoAvaliacao?.configuracoesGerais
        ?.permitirRevisao;
    const estadoSubmissao = submissao.estado;

    const estadosPermitidosParaRevisao = [EstadoSubmissaoEnum.AVALIADA];

    if (
      permitirRevisaoConfig === false ||
      !estadosPermitidosParaRevisao.includes(estadoSubmissao)
    ) {
      throw new ForbiddenException(
        'A revisão não está disponível para esta submissão no momento.',
      );
    }
    return new SubmissaoRevisaoResultDto(submissao);
  }

  async findSubmissaoByHash(hash: string): Promise<SubmissaoQuestoesResultDto> {
    const submissao = await this.submissaoRepository.findOne({
      where: { hash: hash },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'aplicacao.avaliacao.arquivos',
        'aplicacao.avaliacao.arquivos.arquivo',
        'aplicacao.avaliacao.arquivos.arquivo.item',
        'respostas',
        'respostas.questao',
        'respostas.questao.item',
        'respostas.questao.alternativas',
      ],
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada');
    }

    return new SubmissaoQuestoesResultDto(submissao);
  }

  private _createShortHash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }

  private _mapDificuldadeQuestaoToRandomizacao(
    dificuldadeQuestao: DificuldadeQuestaoEnum,
  ): DificuldadeRandomizacaoEnum {
    const mapeamento = {
      [DificuldadeQuestaoEnum.FACIL]: DificuldadeRandomizacaoEnum.FACIL,
      [DificuldadeQuestaoEnum.MEDIO]: DificuldadeRandomizacaoEnum.MEDIO,
      [DificuldadeQuestaoEnum.DIFICIL]: DificuldadeRandomizacaoEnum.DIFICIL,
    };

    return mapeamento[dificuldadeQuestao];
  }

  private async _randomizeQuestoes(
    avaliacao: AvaliacaoModel,
  ): Promise<QuestaoModel[]> {
    const configuracoesRandomizacao =
      avaliacao.configuracaoAvaliacao.configuracoesGerais
        .configuracoesRandomizacao;

    if (configuracoesRandomizacao.length === 0) {
      return avaliacao.questoes
        .sort((a, b) => a.ordem - b.ordem)
        .map((questao) => questao.questao);
    }

    if (
      configuracoesRandomizacao.some(
        (config) => config.tipo === TipoRandomizacaoEnum.SIMPLES,
      )
    ) {
      return avaliacao.questoes
        .map((questao) => questao.questao)
        .sort(() => Math.random() - 0.5);
    }

    if (
      configuracoesRandomizacao.some(
        (config) => config.tipo === TipoRandomizacaoEnum.BANCO_SIMPLES,
      )
    ) {
      const questoes = configuracoesRandomizacao[0].poolDeQuestoes.sort(
        () => Math.random() - 0.5,
      );

      return questoes.slice(0, configuracoesRandomizacao[0].quantidade);
    }

    const questoes = [];
    for (const configuracao of configuracoesRandomizacao) {
      if (configuracao.tipo !== TipoRandomizacaoEnum.BANCO_CONFIGURAVEL) {
        continue;
      }

      let pool: QuestaoModel[];
      if (configuracao.dificuldade === DificuldadeRandomizacaoEnum.QUALQUER) {
        pool = configuracao.poolDeQuestoes;
      } else {
        pool = configuracao.poolDeQuestoes.filter(
          (questao) =>
            this._mapDificuldadeQuestaoToRandomizacao(questao.dificuldade) ===
            configuracao.dificuldade,
        );
      }

      questoes.push(
        ...pool
          .sort(() => Math.random() - 0.5)
          .slice(0, configuracao.quantidade),
      );
    }

    return questoes.sort((a, b) => a.ordem - b.ordem);
  }

  async processarPunicaoPorOcorrencia(
    submissaoHash: string,
    dto: ProcessPunicaoPorCorrenciaDto,
  ): Promise<void> {
    const submissao = await this.submissaoRepository.findOne({
      where: { hash: submissaoHash },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
      ],
    });

    if (
      !submissao ||
      ![EstadoSubmissaoEnum.INICIADA, EstadoSubmissaoEnum.ENVIADA].includes(
        submissao.estado,
      )
    ) {
      throw new NotFoundException('Submissão não encontrada');
    }

    /*
    ======================================================
    Escrever aqui lógica para processar a punicao por ocorrencia

    No momento toda infração recebida pelo socket disparara uma notificação para o AVALIADOR caso a notificação configurada no backend seja EMAIL ou PUSH_NOTIFICATION.
    A lógica a ser feita aqui deve considerar a quantidade de infrações minimas para disparo para o AVALIADOR e para o ESTUDANTE, caso esteja configurado para tal.
    A lógica para disparar a notificação para o ESTUDANTE deve ser feita por meio do gateway de submissao.

    OBS: Lembrar de, caso a infração tenha como punição encerrar avaliação, deve-se alterar o status da submissão para finalizada,
    disparar a notificação para o ESTUDANTE e encerrar a conexão do backend com o socket por meio do gateway de submissao.
    ======================================================
    */

    const quantidadeOcorrencias = 1; // TODO: Implementar lógica para contar as ocorrências

    const notificacoesConfiguradas =
      submissao.aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca
        .notificacoes;

    if (
      notificacoesConfiguradas.some(
        (notificacao) =>
          notificacao.tipoNotificacao === TipoNotificacaoEnum.PUSH_NOTIFICATION,
      )
    ) {
      await this.notificationProvider.sendNotificationViaSocket(
        submissao.aplicacao.avaliacao.item.avaliador.id,
        {
          estudanteId: submissao.estudante.id,
          nomeEstudante: submissao.estudante.nome,
          nomeAvaliacao: submissao.aplicacao.avaliacao.item.titulo,
          dataHoraInfracao: new Date().toLocaleString(),
          quantidadeOcorrencias: quantidadeOcorrencias,
          tipoInfracao: dto.tipoInfracao,
        },
      );
    }

    if (
      notificacoesConfiguradas.some(
        (notificacao) =>
          notificacao.tipoNotificacao === TipoNotificacaoEnum.EMAIL,
      )
    ) {
      const html = this.emailTemplatesProvider.punicaoPorOcorrencia({
        nomeEstudante: submissao.estudante.nome,
        nomeAvaliacao: submissao.aplicacao.avaliacao.item.titulo,
        dataHoraInfracao: new Date().toLocaleString(),
        quantidadeOcorrencias: quantidadeOcorrencias,
        tipoInfracao: dto.tipoInfracao,
        urlPlataforma: `${Env.FRONTEND_URL}`,
      });

      await this.notificationProvider.sendEmail(
        submissao.estudante.email,
        'Provus - Infração de segurança detectada',
        html,
      );
    }
  }
}
