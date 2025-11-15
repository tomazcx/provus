import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
  forwardRef,
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
  isDadosRespostaDiscursiva,
} from 'src/shared/guards/dados-resposta.guard';
import { SubmissaoRevisaoResultDto } from 'src/dto/result/revisao/submissao-revisao.result.dto';
import {
  FindSubmissoesResponseDto,
  SubmissaoComEstudanteDto,
} from 'src/dto/result/submissao/find-submissoes.response.dto';
import { AvaliadorSubmissaoDetalheDto } from 'src/dto/result/submissao/avaliador-submissao-detalhe.dto';
import { RegistroPunicaoPorOcorrenciaModel } from 'src/database/config/models/registro-punicao-por-ocorrencia.model';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import { SubmissaoGateway } from 'src/gateway/gateways/submissao.gateway';
import { QuestaoService } from './questao.service';
import { EvaluateSubmissaoRespostaDto } from 'src/dto/result/submissao/evaluate-submissao-resposta.dto';
import { AbstractAiProvider } from 'src/providers/ai/interface/ai-provider.abstract';

interface SubmissaoFinalizadaPayload {
  submissaoId: number;
  aplicacaoId: number;
  estado: EstadoSubmissaoEnum;
  alunoNome: string;
  timestamp: string;
}
@Injectable()
export class SubmissaoService {
  private readonly logger = new Logger(SubmissaoService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly emailTemplatesProvider: EmailTemplatesProvider,
    private readonly notificationProvider: NotificationProvider,
    @Inject(forwardRef(() => SubmissaoGateway))
    private readonly submissaoGateway: SubmissaoGateway,
    private readonly questaoService: QuestaoService,

    @InjectRepository(AplicacaoModel)
    private readonly aplicacaoRepository: Repository<AplicacaoModel>,

    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,

    @InjectRepository(SubmissaoRespostasModel)
    private readonly submissaoRespostasRepository: Repository<SubmissaoRespostasModel>,

    @InjectRepository(EstudanteModel)
    private readonly estudanteRepository: Repository<EstudanteModel>,

    @InjectRepository(RegistroPunicaoPorOcorrenciaModel)
    private readonly registroPunicaoPorOcorrenciaRepository: Repository<RegistroPunicaoPorOcorrenciaModel>,

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
          'avaliacao.item.avaliador',
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

      if (!aplicacao.avaliacao?.item?.avaliador?.id) {
        this.logger.error(
          `Falha ao carregar avaliador para aplicação ID: ${aplicacao.id}`,
        );
        throw new InternalServerErrorException(
          'Não foi possível identificar o professor responsável pela aplicação.',
        );
      }
      const avaliadorId = aplicacao.avaliacao.item.avaliador.id;
      const questoesParaAluno = await this._randomizeQuestoes(
        aplicacao.avaliacao,
      );
      const totalQuestoesReal = questoesParaAluno.length;

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

          const novaSubmissao = this.submissaoRepository.create({
            aplicacao: aplicacao,
            codigoEntrega: codigoEntrega,
            estudante: estudante,
            hash: hash,
            estado: EstadoSubmissaoEnum.INICIADA,
            pontuacaoTotal: 0,
          });

          const submissaoSalva = await manager.save(novaSubmissao);

          const respostasPromises = questoesParaAluno.map((questao, index) => {
            const submissaoResposta = this.submissaoRespostasRepository.create({
              submissaoId: submissaoSalva.id,
              questaoId: questao.id,
              dadosResposta: {},
              pontuacao: 0,
              ordem: index + 1,
            });
            return manager.save(submissaoResposta);
          });
          await Promise.all(respostasPromises);

          return submissaoSalva;
        },
      );

      try {
        const notificationPayload = {
          submissaoId: submissaoSalva.id,
          aplicacaoId: aplicacao.id,
          aluno: {
            nome: body.nome,
            email: body.email,
          },
          estado: EstadoSubmissaoEnum.INICIADA,
          horaInicio: submissaoSalva.criadoEm.toISOString(),
          totalQuestoes: totalQuestoesReal,
        };

        this.notificationProvider.sendNotificationViaSocket(
          avaliadorId,
          'nova-submissao',
          notificationPayload,
        );
        this.logger.log(
          `Notificação 'nova-submissao' enviada para avaliador ${avaliadorId} referente à submissão ${submissaoSalva.id}`,
        );
      } catch (wsError) {
        this.logger.error(
          `Falha ao enviar notificação WebSocket 'nova-submissao' para avaliador ${avaliadorId}: ${wsError}`,
        );
      }

      const url = `${Env.FRONTEND_URL}/submissao/${submissaoSalva.hash}`;
      const html = this.emailTemplatesProvider.submissaoCriada(
        url,
        aplicacao.avaliacao.item.titulo,
      );

      await this.notificationProvider.sendEmail(
        body.email,
        'Provus - Avaliação iniciada',
        html,
      );

      const submissaoFinal = await this.submissaoRepository.findOneOrFail({
        where: { id: submissaoSalva.id },
        relations: ['estudante'],
      });

      return new SubmissaoResultDto(submissaoFinal);
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
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'respostas.questao',
        'respostas.questao.alternativas',
        'estudante',
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

    let submissaoAtualizada: SubmissaoModel | null = null;

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

        if (!respostaExistente) {
          this.logger.warn(
            `Recebida resposta para questão ID ${respostaDto.questaoId} que não pertence à submissão ${submissao.id}. Ignorando.`,
          );
          continue;
        }

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
      }

      let pontuacaoTotalCalculada = 0;
      let existeDiscursiva = false;
      const respostasParaSalvar: SubmissaoRespostasModel[] = [];

      for (const resposta of submissao.respostas) {
        const questaoGabarito = resposta.questao;
        const dadosRespostaAluno = resposta.dadosResposta;

        let isConsideredAnswered = false;
        if (dadosRespostaAluno) {
          if (
            isDadosRespostaDiscursiva(dadosRespostaAluno) &&
            dadosRespostaAluno.texto.trim() !== ''
          ) {
            isConsideredAnswered = true;
          } else if (
            isDadosRespostaObjetiva(dadosRespostaAluno) &&
            dadosRespostaAluno.alternativa_id !== null
          ) {
            isConsideredAnswered = true;
          } else if (
            isDadosRespostaMultipla(dadosRespostaAluno) &&
            dadosRespostaAluno.alternativas_id.length > 0
          ) {
            isConsideredAnswered = true;
          }
        }

        let pontuacaoObtida = 0;
        let estadoCorrecao: EstadoQuestaoCorrigida | null = null;

        if (!isConsideredAnswered) {
          pontuacaoObtida = 0;
          estadoCorrecao = EstadoQuestaoCorrigida.NAO_RESPONDIDA;
        } else {
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
                pontuacaoObtida = questaoGabarito.pontuacao;
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
                const pontosPorAcerto =
                  questaoGabarito.pontuacao / totalCorretas;
                const penalidadePorErro = pontosPorAcerto;
                pontuacaoCalculada =
                  acertos * pontosPorAcerto - erros * penalidadePorErro;
              }
              pontuacaoObtida = Math.max(0, pontuacaoCalculada);
              if (
                pontuacaoObtida === questaoGabarito.pontuacao &&
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
              estadoCorrecao = EstadoQuestaoCorrigida.NAO_RESPONDIDA;
              existeDiscursiva = true;

              let respostaExistente = '';
              if (isDadosRespostaDiscursiva(dadosRespostaAluno)) {
                respostaExistente = dadosRespostaAluno?.texto;
              }

              if (
                submissao.aplicacao.avaliacao.configuracaoAvaliacao
                  .configuracoesSeguranca.ativarCorrecaoDiscursivaViaIa &&
                respostaExistente.trim() !== ''
              ) {
                const result = await this.questaoService.evaluateByAi({
                  questaoId: questaoGabarito.id,
                  resposta: respostaExistente,
                });
                pontuacaoObtida = parseFloat(result.pontuacao.toFixed(2));
                estadoCorrecao = result.estadoCorrecao;
                resposta.textoRevisao = result.textoRevisao;
              }

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
        }

        resposta.pontuacao = parseFloat(pontuacaoObtida.toFixed(2));
        resposta.estadoCorrecao = estadoCorrecao;
        respostasParaSalvar.push(resposta);
        pontuacaoTotalCalculada += resposta.pontuacao ?? 0;
      }

      if (respostasParaSalvar.length > 0) {
        await respostasRepo.save(respostasParaSalvar);
      }

      const reducaoDePontuacao = await this._calculateReductionOfPoints(
        submissao.id,
      );

      submissao.estado = existeDiscursiva
        ? EstadoSubmissaoEnum.ENVIADA
        : EstadoSubmissaoEnum.AVALIADA;
      submissao.finalizadoEm = new Date();
      submissao.pontuacaoTotal = parseFloat(
        (pontuacaoTotalCalculada - reducaoDePontuacao).toFixed(2),
      );
      submissaoAtualizada = await submissaoRepo.save(submissao);
    });

    if (
      submissaoAtualizada &&
      submissaoAtualizada.aplicacao?.avaliacao?.item?.avaliador?.id
    ) {
      const avaliadorId =
        submissaoAtualizada.aplicacao.avaliacao.item.avaliador.id;
      const aplicacaoId = submissaoAtualizada.aplicacao.id;
      const alunoNome =
        submissaoAtualizada.estudante?.nome ?? 'Aluno Desconhecido';
      const timestamp =
        submissaoAtualizada.finalizadoEm?.toISOString() ??
        new Date().toISOString();

      const payloadFinalizacao: SubmissaoFinalizadaPayload = {
        submissaoId: submissaoAtualizada.id,
        aplicacaoId: aplicacaoId,
        estado: submissaoAtualizada.estado,
        alunoNome: alunoNome,
        timestamp: timestamp,
      };

      try {
        this.notificationProvider.sendNotificationViaSocket(
          avaliadorId,
          'submissao-finalizada',
          payloadFinalizacao,
        );
        this.logger.log(
          `Evento 'submissao-finalizada' (SubId: ${submissaoAtualizada.id}, AppId: ${aplicacaoId}, Estado: ${submissaoAtualizada.estado}) enviado para avaliador ${avaliadorId}`,
        );
      } catch (wsError) {
        this.logger.error(
          `Falha ao enviar notificação WebSocket 'submissao-finalizada' para avaliador ${avaliadorId}: ${wsError}`,
        );
      }
    } else {
      this.logger.error(
        `Não foi possível enviar notificação 'submissao-finalizada' para submissão hash ${hash}. Dados ausentes.`,
      );
    }

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

  async evaluateDiscursiva(
    submissaoId: number,
    aplicacaoId: number,
    questaoId: number,
    dto: EvaluateSubmissaoRespostaDto,
  ): Promise<void> {
    const submissao = await this.submissaoRepository.findOne({
      where: { id: submissaoId, aplicacao: { id: aplicacaoId } },
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada');
    }

    const questao = await this.questaoRepository.findOne({
      where: { id: questaoId },
    });

    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    if (questao.tipoQuestao !== TipoQuestaoEnum.DISCURSIVA) {
      throw new BadRequestException('Questão não é discursiva');
    }

    const resposta = await this.submissaoRespostasRepository.findOne({
      where: { submissaoId: submissaoId, questaoId: questaoId },
    });

    if (!resposta) {
      throw new NotFoundException('Resposta não encontrada');
    }

    resposta.pontuacao = dto.pontuacao;
    resposta.estadoCorrecao = dto.estadoCorrecao;
    resposta.textoRevisao = dto.textoRevisao;

    await this.submissaoRespostasRepository.save(resposta);

    const respostas = await this.submissaoRespostasRepository.find({
      where: { submissaoId: submissaoId },
    });
    const pontuacaoTotal = respostas.reduce(
      (acc, resposta) => acc + (resposta.pontuacao ?? 0),
      0,
    );

    const reducaoDePontuacao =
      await this._calculateReductionOfPoints(submissaoId);

    submissao.pontuacaoTotal = parseFloat(
      (pontuacaoTotal - reducaoDePontuacao).toFixed(2),
    );
    await this.submissaoRepository.save(submissao);
  }

  async updateSubmissaoEstado(
    submissaoId: number,
    aplicacaoId: number,
    estado: EstadoSubmissaoEnum,
  ): Promise<void> {
    const submissao = await this.submissaoRepository.findOne({
      where: { id: submissaoId, aplicacao: { id: aplicacaoId } },
    });
    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada');
    }
    submissao.estado = estado;
    await this.submissaoRepository.save(submissao);
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

  async findSubmissionDetailsForEvaluator(
    aplicacaoId: number,
    submissaoId: number,
    avaliadorId: number,
  ): Promise<AvaliadorSubmissaoDetalheDto> {
    const submissao = await this.submissaoRepository.findOne({
      where: {
        id: submissaoId,
        aplicacao: {
          id: aplicacaoId,
          avaliacao: { item: { avaliador: { id: avaliadorId } } },
        },
      },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.questoes',
        'respostas',
        'respostas.questao',
        'respostas.questao.item',
        'respostas.questao.alternativas',
      ],
    });

    if (!submissao) {
      throw new NotFoundException(
        `Submissão com ID ${submissaoId} não encontrada para a aplicação ${aplicacaoId} ou não pertence a este avaliador.`,
      );
    }

    const pontuacaoTotalAvaliacao =
      submissao.aplicacao?.avaliacao?.questoes?.reduce(
        (sum, qa) => sum + Number(qa.pontuacao || 0),
        0,
      ) ?? 0;

    return new AvaliadorSubmissaoDetalheDto(submissao, pontuacaoTotalAvaliacao);
  }

  async findSubmissionsByApplication(
    aplicacaoId: number,
    avaliadorId: number,
  ): Promise<FindSubmissoesResponseDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: {
        id: aplicacaoId,
        avaliacao: { item: { avaliador: { id: avaliadorId } } },
      },
      relations: ['avaliacao', 'avaliacao.item', 'avaliacao.questoes'],
    });

    if (!aplicacao) {
      throw new NotFoundException(
        'Aplicação não encontrada ou não pertence a este avaliador.',
      );
    }

    const pontuacaoTotal =
      aplicacao.avaliacao.questoes?.reduce(
        (sum, qa) => sum + Number(qa.pontuacao || 0),
        0,
      ) ?? 0;

    const submissoes = await this.submissaoRepository.find({
      where: { aplicacao: { id: aplicacaoId } },
      relations: ['estudante'],
      order: {
        pontuacaoTotal: 'DESC',
        finalizadoEm: 'ASC',
      },
    });

    const submissoesDto = submissoes.map(
      (sub) => new SubmissaoComEstudanteDto(sub),
    );

    return {
      applicationId: aplicacao.id,
      avaliacaoId: aplicacao.avaliacao.id,
      titulo: aplicacao.avaliacao.item.titulo,
      descricao: aplicacao.avaliacao.descricao,
      pontuacaoTotal: pontuacaoTotal,
      dataAplicacao: aplicacao.dataInicio.toISOString(),
      submissoes: submissoesDto,
    };
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
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
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

    const estadoPermitidoParaRevisao = EstadoSubmissaoEnum.AVALIADA;

    if (
      permitirRevisaoConfig === false ||
      estadoSubmissao !== estadoPermitidoParaRevisao
    ) {
      throw new ForbiddenException(
        'A revisão não está disponível para esta submissão no momento.',
      );
    }

    return new SubmissaoRevisaoResultDto(submissao);
  }

  async findSubmissaoByHash(hash: string): Promise<SubmissaoModel> {
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
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
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

    return submissao;
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

  private async _calculateReductionOfPoints(
    submissaoId: number,
  ): Promise<number> {
    const punicoes = await this.registroPunicaoPorOcorrenciaRepository.find({
      where: { submissao: { id: submissaoId } },
      order: { criadoEm: 'DESC' },
      take: 50,
    });
    return punicoes.reduce(
      (acc, punicao) => acc + (punicao.pontuacaoPerdida ?? 0),
      0,
    );
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

    const punicoes =
      submissao.aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes.filter(
        (p) => p.tipoInfracao === dto.tipoInfracao,
      );

    if (punicoes.length === 0) {
      return;
    }

    const quantidadeOcorrencias =
      await this.registroPunicaoPorOcorrenciaRepository.count({
        where: {
          submissao: submissao,
          tipoInfracao: dto.tipoInfracao,
        },
      });

    const totalOcorrencias = quantidadeOcorrencias + 1;

    let tempoReduzido = 0;
    let pontuacaoPerdida = 0;
    let penalidadeAplicada: TipoPenalidadeEnum | null = null;
    for (const punicao of punicoes) {
      if (totalOcorrencias !== punicao.quantidadeOcorrencias) {
        continue;
      }

      penalidadeAplicada = punicao.tipoPenalidade;

      if (punicao.tipoPenalidade === TipoPenalidadeEnum.REDUZIR_PONTOS) {
        pontuacaoPerdida += punicao.pontuacaoPerdida;
        continue;
      }

      if (punicao.tipoPenalidade === TipoPenalidadeEnum.REDUZIR_TEMPO) {
        tempoReduzido += punicao.tempoReduzido;
        this.submissaoGateway.emitReduzirTempoAluno(submissaoHash, {
          tempoReduzido: punicao.tempoReduzido,
        });
        continue;
      }

      if (punicao.tipoPenalidade === TipoPenalidadeEnum.ALERTAR_ESTUDANTE) {
        this.submissaoGateway.emitAlertaEstudante(submissaoHash, {
          quantidadeOcorrencias: quantidadeOcorrencias,
          tipoInfracao: dto.tipoInfracao,
          penalidade: punicao.tipoPenalidade,
        });
        continue;
      }

      if (punicao.tipoPenalidade === TipoPenalidadeEnum.ENCERRAR_AVALIACAO) {
        submissao.estado = EstadoSubmissaoEnum.CANCELADA;
        submissao.finalizadoEm = new Date();
        await this.submissaoRepository.save(submissao);

        await this.submissaoGateway.emitSubmissaoCancelada(submissaoHash, {
          tipoInfracao: dto.tipoInfracao,
          quantidadeOcorrencias: totalOcorrencias,
        });
        continue;
      }

      if (punicao.tipoPenalidade === TipoPenalidadeEnum.NOTIFICAR_PROFESSOR) {
        const notificacoesConfiguradas =
          submissao.aplicacao.avaliacao.configuracaoAvaliacao
            .configuracoesSeguranca.notificacoes;

        if (
          notificacoesConfiguradas.some(
            (notificacao) =>
              notificacao.tipoNotificacao ===
              TipoNotificacaoEnum.PUSH_NOTIFICATION,
          )
        ) {
          this.notificationProvider.sendNotificationViaSocket(
            submissao.aplicacao.avaliacao.item.avaliador.id,
            'punicao-por-ocorrencia',
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
        continue;
      }
    }

    const registroPunicao = this.registroPunicaoPorOcorrenciaRepository.create({
      submissao: submissao,
      tipoInfracao: dto.tipoInfracao,
      quantidadeOcorrencias: totalOcorrencias,
      tipoPenalidade: penalidadeAplicada,
      pontuacaoPerdida: pontuacaoPerdida,
      tempoReduzido: tempoReduzido,
    });

    await this.registroPunicaoPorOcorrenciaRepository.save(registroPunicao);
  }
}
