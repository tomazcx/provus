import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Logger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PunicaoPorOcorrenciaMessage } from '../messages/punicao-por-ocorrencia.message';
import { SubmissaoService } from 'src/services/submissao.service';
import { NotificationProvider } from 'src/providers/notification.provider';

interface TempoAjustadoPayload {
  aplicacaoId: number;
  novaDataFimISO: string;
}

interface EstadoAplicacaoAtualizadoPayload {
  aplicacaoId: number;
  novoEstado: EstadoSubmissaoEnum;
  novaDataFimISO: string;
}
interface AlunoSaiuPayload {
  submissaoId: number;
  aplicacaoId: number;
  alunoNome: string;
  timestamp: string;
}
interface SubmissaoConnectionData {
  submissaoId: number;
  estudanteEmail: string;
  clientId: string;
}

interface ProgressoUpdatePayload {
  totalQuestoes: number;
  questoesRespondidas: number;
  questaoId: number;
  respondida: boolean;
  timestamp: string;
}
@Injectable()
@WebSocketGateway({
  namespace: '/submissao',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SubmissaoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SubmissaoGateway.name);
  private readonly connectedClients = new Map<
    string,
    SubmissaoConnectionData[]
  >();
  private readonly clientsHash = new Map<string, string>();

  constructor(
    private readonly submissaoService: SubmissaoService,

    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Aluno tentando se conectar para avaliação: ${client.id}`);
    this.logger.debug('Handshake Query:', client.handshake.query);
    this.logger.debug('Handshake Auth:', client.handshake.auth);
    try {
      const hash = client.handshake.auth.hash as string | undefined;
      this.logger.debug('Handshake Query:', client.handshake.query);
      this.logger.debug('Handshake Auth:', client.handshake.auth);

      if (!hash) {
        this.logger.warn(`Tentativa de conexão sem hash - Aluno: ${client.id}`);
        client.emit('erro-validacao', {
          message: 'Hash da submissão é obrigatório (auth)',
        });
        client.disconnect();
        return;
      }

      const submissaoData = await this.submissaoRepository.findOne({
        where: { hash },
        relations: [
          'estudante',
          'aplicacao',
          'aplicacao.avaliacao',
          'aplicacao.avaliacao.item',
          'aplicacao.avaliacao.configuracaoAvaliacao',
          'aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        ],
      });

      if (!submissaoData) {
        this.logger.warn(
          `Tentativa de conexão com hash inválido: ${hash} - Aluno: ${client.id}`,
        );
        client.emit('erro-validacao', {
          message: 'Hash de submissão inválido',
        });
        client.disconnect();
        return;
      }

      const estadosValidos = [
        EstadoSubmissaoEnum.INICIADA,
        EstadoSubmissaoEnum.REABERTA,
      ];

      if (!estadosValidos.includes(submissaoData.estado)) {
        this.logger.warn(
          `Tentativa de conexão com submissão em estado inválido: ${submissaoData.estado} - Hash: ${hash} - Aluno: ${client.id}`,
        );
        client.emit('erro-validacao', {
          message: 'Submissão não está disponível para acesso',
          estado: submissaoData.estado,
        });
        client.disconnect();
        return;
      }

      const configSeguranca =
        submissaoData.aplicacao?.avaliacao?.configuracaoAvaliacao
          ?.configuracoesSeguranca;
      if (!configSeguranca) {
        this.logger.error(
          `Configurações de segurança não encontradas para aplicação ${submissaoData.aplicacao?.id}, hash ${hash}`,
        );
        throw new InternalServerErrorException(
          'Erro ao verificar configurações da avaliação.',
        );
      }
      const quantidadeAcessosSimultaneos =
        submissaoData.aplicacao.avaliacao.configuracaoAvaliacao
          .configuracoesSeguranca.quantidadeAcessosSimultaneos;

      const connectionData: SubmissaoConnectionData = {
        clientId: client.id,
        submissaoId: submissaoData.id,
        estudanteEmail: submissaoData.estudante.email,
      };

      const connections = this.connectedClients.get(hash) || [];

      if (connections.length >= quantidadeAcessosSimultaneos) {
        this.logger.warn(
          `Tentativa de conexão com quantidade de acessos simultâneos atingida: ${connections.length} - Hash: ${hash} - Aluno: ${client.id}`,
        );
        client.emit('erro-validacao', {
          message: 'Quantidade de acessos simultâneos atingida',
        });
        client.disconnect();
        return;
      }

      const aplicacaoId = submissaoData.aplicacao.id;
      const roomName = `aplicacao_${aplicacaoId}`;
      await client.join(roomName);

      this.logger.log(
        `Cliente ${client.id} (SubId: ${submissaoData.id}) entrou na sala ${roomName}`,
      );

      connections.push(connectionData);
      this.connectedClients.set(hash, connections);
      this.clientsHash.set(client.id, hash);

      this.logger.log(
        `Conexão estabelecida com sucesso - Hash: ${hash}, Email: ${submissaoData.estudante.email} - Aluno: ${client.id}`,
      );

      client.emit('submissao-validada', {
        message: 'Conexão estabelecida com sucesso',
        submissaoId: submissaoData.id,
        estudante: submissaoData.estudante.nome,
        avaliacao: submissaoData.aplicacao.avaliacao.item.titulo,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao validar submissão durante handshake - Aluno: ${client.id}`,
        error,
      );

      client.emit('erro-validacao', {
        message: 'Erro interno do servidor',
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('registrar-punicao-por-ocorrencia')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PunicaoPorOcorrenciaMessage,
  ) {
    if (!data || !data.tipoInfracao) {
      this.logger.warn(
        `Mensagem inválida: ${JSON.stringify(data)} - Aluno: ${client.id}`,
      );
      return;
    }

    const hash = this.clientsHash.get(client.id);
    if (!hash) {
      this.logger.warn(`Hash não encontrado para o aluno: ${client.id}`);
      return;
    }
    const connections = this.connectedClients.get(hash);
    if (!connections) {
      this.logger.warn(
        `Conexões não encontradas para o hash: ${hash} - Aluno: ${client.id}`,
      );
      return;
    }

    await this.submissaoService.processarPunicaoPorOcorrencia(hash, data);
  }
  async handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Aluno desconectado: ${clientId}`);

    const hash = this.clientsHash.get(clientId);
    if (!hash) {
      this.logger.log(
        `Cliente desconectado ${clientId} não possuía hash associado (provavelmente falhou na conexão inicial).`,
      );
      return;
    }

    this.clientsHash.delete(clientId);

    const connections = this.connectedClients.get(hash);
    if (!connections) {
      this.logger.warn(
        `Hash ${hash} encontrado para ${clientId}, mas não havia lista de conexões no mapa principal.`,
      );
      return;
    }

    const connectionData = connections.find((c) => c.clientId === clientId);
    const updatedConnections = connections.filter(
      (c) => c.clientId !== clientId,
    );

    if (updatedConnections.length === 0) {
      this.connectedClients.delete(hash);
      this.logger.log(
        `Última conexão para o hash ${hash} (Submissão ID: ${connectionData?.submissaoId}) foi fechada.`,
      );

      if (connectionData) {
        try {
          const submissao = await this.submissaoRepository.findOne({
            where: { id: connectionData.submissaoId },
            relations: [
              'estudante',
              'aplicacao',
              'aplicacao.avaliacao',
              'aplicacao.avaliacao.item',
              'aplicacao.avaliacao.item.avaliador',
            ],
          });

          if (
            submissao &&
            submissao.aplicacao?.id &&
            submissao.aplicacao?.avaliacao?.item?.avaliador?.id
          ) {
            const estadosFinais = [
              EstadoSubmissaoEnum.ENVIADA,
              EstadoSubmissaoEnum.AVALIADA,
              EstadoSubmissaoEnum.ENCERRADA,
              EstadoSubmissaoEnum.CANCELADA,
            ];
            if (!estadosFinais.includes(submissao.estado)) {
              const avaliadorId =
                submissao.aplicacao.avaliacao.item.avaliador.id;
              const aplicacaoId = submissao.aplicacao.id;
              const alunoNome =
                submissao.estudante?.nome ?? connectionData.estudanteEmail;

              const payload: AlunoSaiuPayload = {
                submissaoId: submissao.id,
                aplicacaoId: aplicacaoId,
                alunoNome: alunoNome,
                timestamp: new Date().toISOString(),
              };

              this.notificationProvider.sendNotificationViaSocket(
                avaliadorId,
                'aluno-saiu',
                payload,
              );
              this.logger.log(
                `Evento 'aluno-saiu' (SubId: ${submissao.id}, AppId: ${aplicacaoId}) enviado para avaliador ${avaliadorId}`,
              );
            } else {
              this.logger.log(
                `Aluno ${connectionData.submissaoId} desconectou, mas submissão já estava em estado final (${submissao.estado}). Nenhuma notificação 'aluno-saiu' enviada.`,
              );
            }
          } else {
            this.logger.warn(
              `Não foi possível encontrar dados completos da submissão ${connectionData.submissaoId} para notificar desconexão.`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Erro ao buscar dados da submissão ${connectionData.submissaoId} ou notificar desconexão:`,
            error,
          );
        }
      } else {
        this.logger.warn(
          `Dados da conexão não encontrados para o cliente ${clientId} que desconectou.`,
        );
      }
    } else {
      this.connectedClients.set(hash, updatedConnections);
      this.logger.log(
        `Cliente ${clientId} desconectado, mas ainda restam ${updatedConnections.length} conexões para o hash ${hash}.`,
      );
    }
  }

  disconnectClient(clientId: string) {
    const client = this.server.sockets.sockets.get(clientId);
    this.logger.log(`Aluno desconectado: ${clientId}`);
    if (client) {
      client.disconnect();
    }
  }

  @SubscribeMessage('atualizar-progresso')
  async handleProgressoUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ProgressoUpdatePayload,
  ): Promise<void> {
    this.logger.debug(
      `Recebido 'atualizar-progresso' do cliente ${client.id}: ${JSON.stringify(payload)}`,
    );

    const hash = this.clientsHash.get(client.id);
    if (!hash) {
      this.logger.warn(
        `Hash não encontrado para o cliente ${client.id} ao atualizar progresso.`,
      );
      return;
    }

    try {
      const submissao = await this.submissaoRepository.findOne({
        where: {
          hash: hash,
          estado: In([
            EstadoSubmissaoEnum.INICIADA,
            EstadoSubmissaoEnum.REABERTA,
          ]),
        },
        relations: [
          'aplicacao',
          'aplicacao.avaliacao',
          'aplicacao.avaliacao.item',
          'aplicacao.avaliacao.item.avaliador',
          'respostas',
        ],
      });

      if (!submissao || !submissao.aplicacao?.avaliacao?.item?.avaliador?.id) {
        this.logger.warn(
          `Submissão ativa ou avaliador não encontrado para hash ${hash} ao processar progresso.`,
        );
        return;
      }

      const aplicacaoId = submissao.aplicacao.id;
      const avaliadorId = submissao.aplicacao.avaliacao.item.avaliador.id;

      const progressoPercentual =
        payload.totalQuestoes > 0
          ? Math.round(
              (payload.questoesRespondidas / payload.totalQuestoes) * 100,
            )
          : 0;

      const progressoPayloadParaAvaliador = {
        submissaoId: submissao.id,
        progresso: progressoPercentual,
        questoesRespondidas: payload.questoesRespondidas,
        timestamp: payload.timestamp,
        aplicacaoId: aplicacaoId,
      };

      this.notificationProvider.sendNotificationViaSocket(
        avaliadorId,
        'progresso-atualizado',
        progressoPayloadParaAvaliador,
      );

      this.logger.debug(
        `Progresso ${progressoPercentual}% (Questões: ${payload.questoesRespondidas}/${payload.totalQuestoes}) da submissão ${submissao.id} enviado para avaliador ${avaliadorId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao processar 'atualizar-progresso' para cliente ${client.id}, hash ${hash}: ${error}`,
        error,
      );
      client.emit('erro-progresso', {
        message: 'Não foi possível registrar seu progresso no momento.',
      });
    }
  }

  emitTempoAjustadoToAplicacaoRoom(
    aplicacaoId: number,
    payload: TempoAjustadoPayload,
  ): void {
    const roomAplicacao = `aplicacao_${aplicacaoId}`;
    try {
      const result = this.server
        .to(roomAplicacao)
        .emit('tempo-ajustado', payload);
      if (result) {
        this.logger.log(
          `Evento 'tempo-ajustado' emitido para sala ${roomAplicacao} no namespace /submissao`,
        );
      } else {
        this.logger.warn(
          `Tentativa de emitir 'tempo-ajustado' para sala ${roomAplicacao} falhou (sala vazia?).`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao tentar emitir 'tempo-ajustado' para sala ${roomAplicacao}:`,
        error,
      );
    }
  }

  emitEstadoAplicacaoAtualizadoToRoom(
    aplicacaoId: number,
    payload: EstadoAplicacaoAtualizadoPayload,
  ): void {
    const roomAplicacao = `aplicacao_${aplicacaoId}`;
    try {
      this.server
        .to(roomAplicacao)
        .emit('estado-aplicacao-atualizado', payload);
      this.logger.log(
        `Evento 'estado-aplicacao-atualizado' (Estado: ${payload.novoEstado}) emitido para sala ${roomAplicacao}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao emitir 'estado-aplicacao-atualizado' para sala ${roomAplicacao}:`,
        error,
      );
    }
  }
}
