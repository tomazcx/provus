import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
  forwardRef,
  Inject,
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
import { QuestaoService } from './questao.service';
import { EvaluateSubmissaoRespostaDto } from 'src/dto/result/submissao/evaluate-submissao-resposta.dto';
import { FindSubmissaoByHashResponse } from 'src/http/controllers/backoffice/submissao/find-submissao-by-hash/response';
import { SubmissaoGateway } from 'src/gateway/gateways/submissao.gateway';

@Injectable()
export class SubmissaoService {
  private readonly logger = new Logger(SubmissaoService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly emailTemplatesProvider: EmailTemplatesProvider,
    private readonly notificationProvider: NotificationProvider,
    private readonly questaoService: QuestaoService,
    @InjectRepository(AplicacaoModel)
    private readonly aplicacaoRepository: Repository<AplicacaoModel>,
    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,
    @InjectRepository(SubmissaoRespostasModel)
    private readonly submissaoRespostasRepository: Repository<SubmissaoRespostasModel>,
    @InjectRepository(RegistroPunicaoPorOcorrenciaModel)
    private readonly registroPunicaoPorOcorrenciaRepository: Repository<RegistroPunicaoPorOcorrenciaModel>,
    @InjectRepository(QuestaoModel)
    private readonly questaoRepository: Repository<QuestaoModel>,
    @Inject(forwardRef(() => SubmissaoGateway))
    private readonly submissaoGateway: SubmissaoGateway,
  ) {}

  async createSubmissao(
    body: CreateSubmissaoRequest,
  ): Promise<FindSubmissaoByHashResponse> {
    try {
      const aplicacao = await this.aplicacaoRepository.findOne({
        where: {
          codigoAcesso: body.codigoAcesso,
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
          'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        ],
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      const questoesParaAluno = this._randomizeQuestoes(aplicacao.avaliacao);

      const submissaoSalva = await this.dataSource.transaction(
        async (manager) => {
          const estudanteExistente = await manager
            .createQueryBuilder(EstudanteModel, 'estudante')
            .innerJoinAndSelect('estudante.submissao', 'submissao')
            .innerJoinAndSelect('submissao.aplicacao', 'aplicacao')
            .where('estudante.email = :email', { email: body.email })
            .andWhere('aplicacao.id = :aplicacaoId', {
              aplicacaoId: aplicacao.id,
            })
            .getOne();

          if (estudanteExistente) {
            return estudanteExistente.submissao;
          } else {
            if (aplicacao.estado === EstadoAplicacaoEnum.CRIADA) {
              throw new BadRequestException(
                'A avaliação ainda não foi iniciada pelo professor. Aguarde o início.',
              );
            }

            if (aplicacao.estado === EstadoAplicacaoEnum.AGENDADA) {
              const now = new Date();
              if (now < aplicacao.dataInicio) {
                throw new BadRequestException(
                  `A avaliação ainda não começou. Aguarde o horário agendado (${aplicacao.dataInicio.toLocaleString()}).`,
                );
              }
              this.logger.log(
                `Aplicação AGENDADA ${aplicacao.id} iniciada automaticamente pelo acesso do aluno.`,
              );
              aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
              await manager.save(aplicacao);

              if (aplicacao.avaliacao?.item?.avaliador?.id) {
                this.notificationProvider.sendNotificationViaSocket(
                  aplicacao.avaliacao.item.avaliador.id,
                  'estado-aplicacao-atualizado',
                  {
                    aplicacaoId: aplicacao.id,
                    novoEstado: EstadoAplicacaoEnum.EM_ANDAMENTO,
                    novaDataFimISO: aplicacao.dataFim.toISOString(),
                  },
                );
              }
            }

            if (aplicacao.estado !== EstadoAplicacaoEnum.EM_ANDAMENTO) {
              throw new BadRequestException(
                'Esta aplicação não está aceitando novas submissões (Encerrada ou Cancelada).',
              );
            }

            if (!aplicacao.avaliacao?.item?.avaliador?.id) {
              this.logger.error(
                `Falha ao carregar avaliador para aplicação ID: ${aplicacao.id}`,
              );
              throw new InternalServerErrorException(
                'Não foi possível identificar o professor responsável pela aplicação.',
              );
            }

            const novoEstudiante = manager.create(EstudanteModel, {
              nome: body.nome,
              email: body.email,
            });

            const codigoEntrega =
              await this._generateUniqueSubmissionCode(manager);
            const hash = this._createShortHash(body.codigoAcesso + body.email);

            const now = new Date();

            const novaSubmissao = manager.create(SubmissaoModel, {
              aplicacao: aplicacao,
              codigoEntrega: codigoEntrega,
              estudante: novoEstudiante,
              hash: hash,
              estado: EstadoSubmissaoEnum.INICIADA,
              pontuacaoTotal: 0,
              criadoEm: now,
              atualizadoEm: now,
            });
            const submissaoFinal = await manager.save(novaSubmissao);

            if (questoesParaAluno.length > 0) {
              const respostasBatch = questoesParaAluno.map(
                (questao, index) => ({
                  submissaoId: submissaoFinal.id,
                  questaoId: questao.id,
                  dadosResposta: {},
                  pontuacao: 0,
                  ordem: index + 1,
                }),
              );
              await manager.insert(SubmissaoRespostasModel, respostasBatch);
            }

            return submissaoFinal;
          }
        },
      );

      if (submissaoSalva.estado === EstadoSubmissaoEnum.INICIADA) {
        const url = `${Env.FRONTEND_URL}/submissao/${submissaoSalva.hash}`;
        const html = this.emailTemplatesProvider.submissaoCriada(
          url,
          aplicacao.avaliacao.item.titulo,
        );
        this.notificationProvider
          .sendEmail(body.email, 'Provus - Avaliação iniciada', html)
          .catch((emailError) => {
            this.logger.error(
              `Falha ao enviar email de início (Background): ${emailError.message}`,
            );
          });
      }

      const responseLight = new FindSubmissaoByHashResponse();
      responseLight.submissao = new SubmissaoResultDto(submissaoSalva);
      responseLight.questoes = [];
      responseLight.arquivos = [];

      return responseLight;
    } catch (error) {
      this.logger.error('Falha ao criar/entrar na submissão', error);
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

    const configGerais =
      submissao.aplicacao?.configuracao?.configuracoesGerais ??
      submissao.aplicacao?.avaliacao?.configuracaoAvaliacao
        ?.configuracoesGerais;

    const tempoMinimoMinutos = configGerais?.tempoMinimo || 0;
    if (tempoMinimoMinutos > 0) {
      const agora = new Date();
      const inicioSubmissao = submissao.criadoEm;
      const tempoDecorridoMinutos =
        (agora.getTime() - inicioSubmissao.getTime()) / 1000 / 60;

      if (tempoDecorridoMinutos < tempoMinimoMinutos) {
        const falta = Math.ceil(tempoMinimoMinutos - tempoDecorridoMinutos);
        throw new BadRequestException(
          `Você deve aguardar pelo menos ${tempoMinimoMinutos} minutos de prova. Faltam aproximadamente ${falta} minutos.`,
        );
      }
    }

    let submissaoSalva: SubmissaoModel | null = null;

    await this.dataSource.transaction(async (manager) => {
      const submissaoRepo = manager.getRepository(SubmissaoModel);
      const respostasRepo = manager.getRepository(SubmissaoRespostasModel);

      const respostasExistentesMap = new Map<number, SubmissaoRespostasModel>();
      submissao.respostas.forEach((r) =>
        respostasExistentesMap.set(r.questaoId, r),
      );

      const respostasParaSalvar: SubmissaoRespostasModel[] = [];

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
        respostaExistente.pontuacao = 0;
        respostaExistente.estadoCorrecao =
          EstadoQuestaoCorrigida.NAO_RESPONDIDA;

        respostasParaSalvar.push(respostaExistente);
      }

      if (respostasParaSalvar.length > 0) {
        await respostasRepo.save(respostasParaSalvar);
      }

      submissao.estado = EstadoSubmissaoEnum.ENVIADA;
      submissao.finalizadoEm = new Date();
      submissao.pontuacaoTotal = 0;

      submissaoSalva = await submissaoRepo.save(submissao);
    });

    if (
      submissaoSalva &&
      submissaoSalva.aplicacao?.avaliacao?.item?.avaliador?.id
    ) {
      const avaliadorId = submissaoSalva.aplicacao.avaliacao.item.avaliador.id;
      const aplicacaoId = submissaoSalva.aplicacao.id;
      const alunoNome = submissaoSalva.estudante?.nome ?? 'Aluno Desconhecido';
      const timestamp =
        submissaoSalva.finalizadoEm?.toISOString() ?? new Date().toISOString();

      const payloadFinalizacao = {
        submissaoId: submissaoSalva.id,
        aplicacaoId: aplicacaoId,
        estado: submissaoSalva.estado,
        alunoNome: alunoNome,
        timestamp: timestamp,
      };

      try {
        this.notificationProvider.sendNotificationViaSocket(
          avaliadorId,
          'submissao-finalizada',
          payloadFinalizacao,
        );
      } catch (wsError) {
        this.logger.error(
          `Falha ao enviar notificação WebSocket 'submissao-finalizada': ${wsError}`,
        );
      }
    }

    this._processarCorrecaoAssincrona(submissaoSalva.id).catch((err) => {
      this.logger.error(
        `Erro crítico na correção assíncrona da submissão ${submissaoSalva.id}`,
        err,
      );
    });

    return new SubmissaoResultDto(submissaoSalva);
  }

  private async _processarCorrecaoAssincrona(
    submissaoId: number,
  ): Promise<void> {
    this.logger.log(
      `Iniciando correção assíncrona para submissão ${submissaoId}...`,
    );

    const submissao = await this.submissaoRepository.findOne({
      where: { id: submissaoId },
      relations: [
        'respostas',
        'respostas.questao',
        'respostas.questao.alternativas',
        'respostas.questao.item',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'estudante',
      ],
    });

    if (!submissao) return;

    const configSeguranca =
      submissao.aplicacao?.configuracao?.configuracoesSeguranca ??
      submissao.aplicacao?.avaliacao?.configuracaoAvaliacao
        ?.configuracoesSeguranca;

    const isAiCorrectionEnabled =
      configSeguranca?.ativarCorrecaoDiscursivaViaIa ?? false;

    let pontuacaoTotalCalculada = 0;
    let correcaoManualPendente = false;
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
              const pontosPorAcerto = questaoGabarito.pontuacao / totalCorretas;
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
            let respostaExistente = '';
            if (isDadosRespostaDiscursiva(dadosRespostaAluno)) {
              respostaExistente = dadosRespostaAluno?.texto ?? '';
            }

            if (isAiCorrectionEnabled) {
              try {
                const result = await this.questaoService.evaluateByAi({
                  questaoId: questaoGabarito.id,
                  resposta: respostaExistente,
                });

                pontuacaoObtida = parseFloat(result.pontuacao.toFixed(2));
                estadoCorrecao = result.estadoCorrecao;
                resposta.textoRevisao = result.textoRevisao;
              } catch (error) {
                this.logger.error(
                  `Falha na correção IA questão ${questaoGabarito.id}:`,
                  error,
                );
                correcaoManualPendente = true;
                pontuacaoObtida = 0;
                estadoCorrecao = EstadoQuestaoCorrigida.NAO_RESPONDIDA;
                resposta.textoRevisao =
                  'Erro na correção automática. Aguardando professor.';
              }
            } else {
              correcaoManualPendente = true;
              pontuacaoObtida = 0;
              estadoCorrecao = EstadoQuestaoCorrigida.NAO_RESPONDIDA;
              resposta.textoRevisao =
                'Esta questão será corrigida manualmente pelo professor.';
            }
            break;
          }
          default: {
            this.logger.warn(
              `Tipo de questão desconhecido: ${String(questaoGabarito.tipoQuestao)}`,
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
      await this.submissaoRespostasRepository.save(respostasParaSalvar);
    }

    const reducaoDePontuacao = await this._calculateReductionOfPoints(
      submissao.id,
    );

    submissao.estado = correcaoManualPendente
      ? EstadoSubmissaoEnum.ENVIADA
      : EstadoSubmissaoEnum.AVALIADA;

    submissao.pontuacaoTotal = parseFloat(
      (pontuacaoTotalCalculada - reducaoDePontuacao).toFixed(2),
    );

    await this.submissaoRepository.save(submissao);

    this.logger.log(
      `Correção assíncrona finalizada (ID: ${submissao.id}). Estado Final: ${submissao.estado}`,
    );

    this.submissaoGateway.emitResultadoProcessado(submissao.hash, {
      estado: submissao.estado,
      pontuacaoTotal: submissao.pontuacaoTotal,
    });
  }

  async evaluateDiscursiva(
    submissaoId: number,
    aplicacaoId: number,
    questaoId: number,
    dto: EvaluateSubmissaoRespostaDto,
  ): Promise<void> {
    const submissao = await this.submissaoRepository.findOne({
      where: { id: submissaoId, aplicacao: { id: aplicacaoId } },
      relations: ['estudante'],
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
      (acc, resposta) => acc + (Number(resposta.pontuacao) || 0),
      0,
    );

    const reducaoDePontuacao =
      await this._calculateReductionOfPoints(submissaoId);

    submissao.pontuacaoTotal = parseFloat(
      (pontuacaoTotal - reducaoDePontuacao).toFixed(2),
    );

    await this.submissaoRepository.save(submissao);

    this.submissaoGateway.emitResultadoProcessado(submissao.hash, {
      estado: submissao.estado,
      pontuacaoTotal: submissao.pontuacaoTotal,
    });

    this.logger.log(
      `Correção manual da questão ${questaoId} salva. Notificação enviada para submissão ${submissao.hash}`,
    );
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

    this.submissaoGateway.emitResultadoProcessado(submissao.hash, {
      estado: submissao.estado,
      pontuacaoTotal: submissao.pontuacaoTotal,
    });

    this.logger.log(
      `Estado da submissão ${submissaoId} atualizado para ${estado}. Notificação enviada.`,
    );
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
        'aplicacao.configuracao',
        'aplicacao.configuracao.configuracoesGerais',
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

    const configGerais =
      submissao.aplicacao?.configuracao?.configuracoesGerais ??
      submissao.aplicacao?.avaliacao?.configuracaoAvaliacao
        ?.configuracoesGerais;

    const permitirRevisaoConfig = configGerais?.permitirRevisao;
    const estadoSubmissao = submissao.estado;

    const estadosPermitidosParaRevisao = [
      EstadoSubmissaoEnum.AVALIADA,
      EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
    ];

    if (
      permitirRevisaoConfig === false ||
      !estadosPermitidosParaRevisao.includes(estadoSubmissao)
    ) {
      throw new ForbiddenException(
        `A revisão não está disponível para esta submissão no momento (Estado: ${estadoSubmissao}).`,
      );
    }

    return new SubmissaoRevisaoResultDto(submissao);
  }

  async findSubmissaoByHash(
    hash: string,
  ): Promise<FindSubmissaoByHashResponse> {
    const submissao = await this.submissaoRepository.findOne({
      where: { hash: hash },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
        'aplicacao.configuracao',
        'aplicacao.configuracao.configuracoesGerais',
        'aplicacao.configuracao.configuracoesSeguranca',
        'aplicacao.avaliacao.configuracaoAvaliacao',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'aplicacao.avaliacao.arquivos',
        'aplicacao.avaliacao.arquivos.arquivo',
        'aplicacao.avaliacao.arquivos.arquivo.item',
        'aplicacao.avaliacao.questoes',
        'respostas',
        'respostas.questao',
        'respostas.questao.item',
        'respostas.questao.alternativas',
        'registrosPunicaoPorOcorrencia',
      ],
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada');
    }

    const responseDto = FindSubmissaoByHashResponse.fromModel(submissao);

    if (submissao.respostas && submissao.respostas.length > 0) {
      const totalPontosReais = submissao.respostas.reduce((acc, resp) => {
        return acc + (Number(resp.questao.pontuacao) || 0);
      }, 0);

      responseDto.pontuacaoMaxima = totalPontosReais;

      responseDto.questoes = submissao.respostas
        .sort((a, b) => a.ordem - b.ordem)
        .map((resp) => ({
          id: resp.questao.id,
          titulo: resp.questao.item.titulo,
          descricao: resp.questao.descricao,
          pontuacao: resp.questao.pontuacao,
          dificuldade: resp.questao.dificuldade,
          tipo: resp.questao.tipoQuestao,
          alternativas: resp.questao.alternativas.map((alt) => ({
            id: alt.id,
            descricao: alt.descricao,
          })),
          dadosResposta: resp.dadosResposta,
          pontuacaoObtida: resp.pontuacao,
          estadoCorrecao: resp.estadoCorrecao,
          textoRevisao: resp.textoRevisao,
        }));
    }

    const estadosAtivos = [
      EstadoSubmissaoEnum.INICIADA,
      EstadoSubmissaoEnum.REABERTA,
      EstadoSubmissaoEnum.PAUSADA,
    ];

    if (!estadosAtivos.includes(submissao.estado)) {
      responseDto.questoes = [];
      responseDto.arquivos = [];
    }

    return responseDto;
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

  private _randomizeQuestoes(avaliacao: AvaliacaoModel): QuestaoModel[] {
    const configuracoesRandomizacao =
      avaliacao.configuracaoAvaliacao.configuracoesGerais
        .configuracoesRandomizacao;

    if (!configuracoesRandomizacao || configuracoesRandomizacao.length === 0) {
      return (avaliacao.questoes || [])
        .sort((a, b) => a.ordem - b.ordem)
        .map((q) => q.questao);
    }

    if (
      configuracoesRandomizacao.some(
        (config) => config.tipo === TipoRandomizacaoEnum.SIMPLES,
      )
    ) {
      const questoesFixas = (avaliacao.questoes || []).map((q) => q.questao);
      return this._shuffleArray(questoesFixas);
    }

    if (
      configuracoesRandomizacao.some(
        (config) => config.tipo === TipoRandomizacaoEnum.BANCO_SIMPLES,
      )
    ) {
      const config = configuracoesRandomizacao[0];
      if (!config.poolDeQuestoes || config.poolDeQuestoes.length === 0) {
        return [];
      }

      const poolEmbaralhado = this._shuffleArray(config.poolDeQuestoes);

      return poolEmbaralhado.slice(0, config.quantidade);
    }

    const questoesSelecionadas: QuestaoModel[] = [];

    for (const configuracao of configuracoesRandomizacao) {
      if (configuracao.tipo !== TipoRandomizacaoEnum.BANCO_CONFIGURAVEL) {
        continue;
      }

      let poolFiltrado: QuestaoModel[];

      if (configuracao.dificuldade === DificuldadeRandomizacaoEnum.QUALQUER) {
        poolFiltrado = configuracao.poolDeQuestoes;
      } else {
        poolFiltrado = configuracao.poolDeQuestoes.filter(
          (questao) =>
            this._mapDificuldadeQuestaoToRandomizacao(questao.dificuldade) ===
            configuracao.dificuldade,
        );
      }

      if (poolFiltrado && poolFiltrado.length > 0) {
        const poolEmbaralhado = this._shuffleArray(poolFiltrado);

        questoesSelecionadas.push(
          ...poolEmbaralhado.slice(0, configuracao.quantidade),
        );
      }
    }

    return this._shuffleArray(questoesSelecionadas);
  }

  private _shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async processarPunicaoPorOcorrencia(
    submissaoHash: string,
    dto: ProcessPunicaoPorCorrenciaDto,
  ): Promise<RegistroPunicaoPorOcorrenciaModel[] | null> {
    this.logger.debug(
      `[DEPURAÇÃO] Iniciando processarPunicaoPorOcorrencia. Hash: ${submissaoHash}`,
    );

    return await this.dataSource.transaction(async (manager) => {
      const submissao = await manager.findOne(SubmissaoModel, {
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
        ],
      });

      const estadosValidos = [
        EstadoSubmissaoEnum.INICIADA,
        EstadoSubmissaoEnum.REABERTA,
        EstadoSubmissaoEnum.PAUSADA,
      ];

      if (!submissao || !estadosValidos.includes(submissao.estado)) {
        this.logger.warn(
          `[DEPURAÇÃO] Submissão não encontrada ou em estado inválido (${
            submissao?.estado ?? 'N/A'
          }). Abortando.`,
        );
        throw new NotFoundException('Submissão não encontrada');
      }

      const punicoesConfiguradas =
        submissao.aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes.filter(
          (p) => p.tipoInfracao === dto.tipoInfracao,
        );

      if (punicoesConfiguradas.length === 0) {
        this.logger.debug(
          `[DEPURAÇÃO] Nenhuma regra de punição encontrada para ${dto.tipoInfracao}. Abortando.`,
        );
        return null;
      }

      const quantidadeOcorrenciasAnteriores = await manager.count(
        RegistroPunicaoPorOcorrenciaModel,
        {
          where: {
            submissao: { id: submissao.id },
            tipoInfracao: dto.tipoInfracao,
          },
        },
      );

      const totalOcorrenciasAtual = quantidadeOcorrenciasAnteriores + 1;
      this.logger.debug(
        `[DEPURAÇÃO] Contagem de infrações: ${quantidadeOcorrenciasAnteriores} existentes. Novo total: ${totalOcorrenciasAtual}.`,
      );

      const punicoesAplicadas: RegistroPunicaoPorOcorrenciaModel[] = [];
      let deveEncerrar = false;

      for (const punicao of punicoesConfiguradas) {
        const gatilhoX = punicao.quantidadeOcorrencias;
        const limiteY = punicao.quantidadeAplicacoes;
        const isSempre = punicao.sempre;
        const isExata =
          !isSempre && (limiteY === null || limiteY === undefined);

        if (totalOcorrenciasAtual < gatilhoX) {
          continue;
        }

        let aplicarPunicao = false;

        if (isExata && totalOcorrenciasAtual === gatilhoX) {
          aplicarPunicao = true;
          this.logger.debug(
            `[DEPURAÇÃO] Regra EXATA ativada: ID ${punicao.id} (na ${totalOcorrenciasAtual}ª ocorrência)`,
          );
        } else if (isSempre) {
          aplicarPunicao = true;
          this.logger.debug(
            `[DEPURAÇÃO] Regra SEMPRE ativada: ID ${punicao.id} (na ${totalOcorrenciasAtual}ª ocorrência, gatilho era ${gatilhoX})`,
          );
        } else if (limiteY && limiteY > 0) {
          const vezesAplicada = await manager.count(
            RegistroPunicaoPorOcorrenciaModel,
            {
              where: {
                submissao: { id: submissao.id },
                punicaoConfigId: punicao.id,
              },
            },
          );

          if (vezesAplicada < limiteY) {
            aplicarPunicao = true;
            this.logger.debug(
              `[DEPURAÇÃO] Regra Y VEZES ativada: ID ${punicao.id} (Aplicada ${
                vezesAplicada + 1
              }/${limiteY} vezes)`,
            );
          } else {
            this.logger.debug(
              `[DEPURAÇÃO] Regra Y VEZES ignorada: ID ${punicao.id} (Limite ${limiteY} atingido)`,
            );
          }
        }

        if (aplicarPunicao) {
          if (
            punicao.tipoPenalidade === TipoPenalidadeEnum.ENCERRAR_AVALIACAO
          ) {
            deveEncerrar = true;
          }

          const registro = manager.create(RegistroPunicaoPorOcorrenciaModel, {
            submissao: submissao,
            tipoInfracao: dto.tipoInfracao,
            quantidadeOcorrencias: totalOcorrenciasAtual,
            tipoPenalidade: punicao.tipoPenalidade,
            pontuacaoPerdida: punicao.pontuacaoPerdida,
            tempoReduzido: punicao.tempoReduzido,
            punicaoConfigId: punicao.id,
          });

          const registroSalvo = await manager.save(registro);
          punicoesAplicadas.push(registroSalvo);
          this.logger.debug(
            `[DEPURAÇÃO] Registro de infração salvo (ID: ${registroSalvo.id}) para Regra ID: ${punicao.id}`,
          );
        }
      }

      if (punicoesAplicadas.length > 0) {
        this.notificationProvider.sendNotificationViaSocket(
          submissao.aplicacao.avaliacao.item.avaliador.id,
          'punicao-por-ocorrencia',
          {
            estudanteId: submissao.estudante.id,
            nomeEstudante: submissao.estudante.nome,
            estudanteEmail: submissao.estudante.email,
            nomeAvaliacao: submissao.aplicacao.avaliacao.item.titulo,
            dataHoraInfracao: new Date().toLocaleString(),
            quantidadeOcorrencias: totalOcorrenciasAtual,
            tipoInfracao: dto.tipoInfracao,
          },
        );
        this.logger.debug(
          `[DEPURAÇÃO] Notificação WebSocket 'punicao-por-ocorrencia' enviada ao avaliador.`,
        );
      } else {
        this.logger.warn(
          `[DEPURAÇÃO] Nenhuma regra de punição foi ATIVADA para ${totalOcorrenciasAtual} ocorrências. Salvando registro genérico.`,
        );
        const registroGenerico = manager.create(
          RegistroPunicaoPorOcorrenciaModel,
          {
            submissao: submissao,
            tipoInfracao: dto.tipoInfracao,
            quantidadeOcorrencias: totalOcorrenciasAtual,
            tipoPenalidade: null,
            pontuacaoPerdida: 0,
            tempoReduzido: 0,
            punicaoConfigId: null,
          },
        );
        await manager.save(registroGenerico);
      }

      if (deveEncerrar) {
        submissao.estado = EstadoSubmissaoEnum.CANCELADA;
        submissao.finalizadoEm = new Date();
        await manager.save(submissao);
        this.logger.debug(
          `[DEPURAÇÃO] Punição: ENCERRAR_AVALIACAO. Estado salvo como CANCELADA.`,
        );
        const registroEncerrar = punicoesAplicadas.find(
          (p) => p.tipoPenalidade === TipoPenalidadeEnum.ENCERRAR_AVALIACAO,
        );
        return [registroEncerrar];
      }

      return punicoesAplicadas;
    });
  }

  async confirmarCodigoEntrega(
    submissaoId: number,
    aplicacaoId: number,
    codigoEntregaInput: number,
  ): Promise<SubmissaoResultDto> {
    const submissao = await this.submissaoRepository.findOne({
      where: { id: submissaoId, aplicacao: { id: aplicacaoId } },
      relations: [
        'estudante',
        'aplicacao',
        'aplicacao.avaliacao',
        'aplicacao.avaliacao.item',
        'aplicacao.avaliacao.item.avaliador',
      ],
    });

    if (!submissao) {
      throw new NotFoundException('Submissão não encontrada');
    }

    if (submissao.codigoEntrega !== codigoEntregaInput) {
      this.logger.warn(
        `Tentativa de confirmação falhou para submissao ${submissaoId}. Código esperado: ${submissao.codigoEntrega}, Recebido: ${codigoEntregaInput}`,
      );
      throw new BadRequestException('Código de entrega incorreto.');
    }

    const estadosValidosParaConfirmar = [
      EstadoSubmissaoEnum.ENVIADA,
      EstadoSubmissaoEnum.AVALIADA,
    ];

    if (estadosValidosParaConfirmar.includes(submissao.estado)) {
      submissao.estado = EstadoSubmissaoEnum.CODIGO_CONFIRMADO;
      const submissaoSalva = await this.submissaoRepository.save(submissao);

      if (submissao.aplicacao?.avaliacao?.item?.avaliador?.id) {
        const avaliadorId = submissao.aplicacao.avaliacao.item.avaliador.id;
        this.notificationProvider.sendNotificationViaSocket(
          avaliadorId,
          'codigo-confirmado',
          {
            submissaoId: submissao.id,
            aplicacaoId: aplicacaoId,
            estado: EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
            alunoNome: submissao.estudante.nome,
            timestamp: new Date().toISOString(),
          },
        );
        this.logger.log(
          `Evento 'codigo-confirmado' enviado para avaliador ${avaliadorId}`,
        );
      }
      return new SubmissaoResultDto(submissaoSalva);
    }

    return new SubmissaoResultDto(submissao);
  }
}
