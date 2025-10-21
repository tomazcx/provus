import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/services/auth.service';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { SubmissaoGateway } from './submissao.gateway';
import { NotificationProvider } from 'src/providers/notification.provider';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
interface AplicacaoIdPayload {
  aplicacaoId: number;
}

interface EstadoAplicacaoAtualizadoPayloadAvaliador {
  aplicacaoId: number;
  novoEstado: EstadoAplicacaoEnum;
  novaDataFimISO: string;
}
interface EstadoAplicacaoAtualizadoPayloadSubmissao {
  aplicacaoId: number;
  novoEstado: EstadoSubmissaoEnum;
  novaDataFimISO: string;
}
interface AjustarTempoPayload {
  aplicacaoId: number;
  segundos: number;
}

interface ReiniciarTimerPayload {
  aplicacaoId: number;
}

interface TempoAjustadoPayload {
  aplicacaoId: number;
  novaDataFimISO: string;
}

@Injectable()
@WebSocketGateway({
  namespace: '/avaliador',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class AvaliadorGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AvaliadorGateway.name);
  private readonly clientToAvaliadorMap = new Map<string, AvaliadorModel>();

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly aplicacaoService: AplicacaoService,
    @Inject(forwardRef(() => SubmissaoGateway))
    private readonly submissaoGateway: SubmissaoGateway,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  onModuleInit() {
    this.notificationProvider.setAvaliadorGateway(this);
    this.logger.log(
      'AvaliadorGateway configurado no NotificationProvider com sucesso',
    );
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Avaliador tentando se conectar: ${client.id}`);
    this.logger.debug('Auth Object Recebido:', client.handshake.auth);
    try {
      const tokenAuth = client.handshake.auth.token as string | undefined;

      if (!tokenAuth || !tokenAuth.startsWith('Bearer ')) {
        this.logger.warn(
          `Tentativa de conexão sem token válido no auth - Avaliador: ${client.id}`,
        );
        client.emit('erro-validacao', {
          message: 'Token de autenticação é obrigatório ou inválido',
        });
        client.disconnect();
        return;
      }

      const splitToken = tokenAuth.split(' ')[1];
      const avaliador = await this.authService.validateToken(splitToken);

      if (!avaliador) {
        this.logger.warn(`Token inválido no auth - Avaliador: ${client.id}`);
        client.emit('erro-validacao', {
          message: 'Token de autenticação inválido',
        });
        client.disconnect();
        return;
      }

      const avaliadorId = avaliador.id;
      const roomName = `avaliador_${avaliadorId}`;

      await client.join(roomName);
      this.clientToAvaliadorMap.set(client.id, avaliador);

      this.logger.log(
        `Avaliador conectado e entrou na sala ${roomName}: ${client.id} (ID: ${avaliadorId})`,
      );
      client.emit('avaliador-conectado', {
        message: `Conectado com sucesso e inscrito na sala ${roomName}`,
        avaliadorId: avaliadorId,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao conectar avaliador via auth: ${client.id}`,
        error,
      );
      client.emit('erro-validacao', {
        message: 'Erro ao conectar avaliador',
      });
      client.disconnect();
    }
  }

  sendMessageToAvaliador<T extends object>(
    avaliadorId: number,
    eventName: string,
    message: T,
  ) {
    const roomName = `avaliador_${avaliadorId}`;
    const result = this.server.to(roomName).emit(eventName, message);

    if (result) {
      this.logger.log(`Evento '${eventName}' emitido para a sala ${roomName}`);
    } else {
      this.logger.warn(
        `Falha ao direcionar evento '${eventName}' para a sala ${roomName}. A sala pode não existir no adaptador.`,
      );
    }
  }

  async handleDisconnect(client: Socket) {
    const avaliador = this.clientToAvaliadorMap.get(client.id);

    if (avaliador !== undefined) {
      this.clientToAvaliadorMap.delete(client.id);
      this.logger.log(
        `Avaliador desconectado (ID: ${avaliador.id}): ${client.id}`,
      );
      await this.checkIfRoomIsEmpty(avaliador.id);
    } else {
      this.logger.log(
        `Cliente desconectado (não autenticado como avaliador): ${client.id}`,
      );
    }
  }

  private async checkIfRoomIsEmpty(avaliadorId: number): Promise<void> {
    const roomName = `avaliador_${avaliadorId}`;
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const socketsInRoom = await this.server.in(roomName).allSockets();
      if (socketsInRoom.size === 0) {
        this.logger.log(`Sala ${roomName} agora está vazia.`);
      } else {
        this.logger.log(
          `Sala ${roomName} ainda tem ${socketsInRoom.size} conexões ativas.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao verificar sockets na sala ${roomName}:`,
        error,
      );
    }
  }

  private mapAplicacaoEstadoToSubmissaoEstado(
    appEstado: EstadoAplicacaoEnum,
  ): EstadoSubmissaoEnum {
    switch (appEstado) {
      case EstadoAplicacaoEnum.EM_ANDAMENTO:
        return EstadoSubmissaoEnum.INICIADA;
      case EstadoAplicacaoEnum.PAUSADA:
        return EstadoSubmissaoEnum.PAUSADA;
      case EstadoAplicacaoEnum.FINALIZADA:
      case EstadoAplicacaoEnum.CONCLUIDA:
      case EstadoAplicacaoEnum.CANCELADA:
        return EstadoSubmissaoEnum.ENCERRADA;
      default:
        return EstadoSubmissaoEnum.ENCERRADA;
    }
  }

  private async handleEstadoChange(
    client: Socket,
    payload: AplicacaoIdPayload,
    novoEstadoApp: EstadoAplicacaoEnum,
    eventNameForLog: string,
  ): Promise<void> {
    const avaliador = this.clientToAvaliadorMap.get(client.id);
    if (avaliador === undefined) {
      this.logger.warn(
        `Cliente ${client.id} não autenticado tentou ${eventNameForLog}.`,
      );
      client.emit('erro-operacao', { message: 'Não autorizado.' });
      return;
    }

    this.logger.log(
      `Avaliador ${avaliador.id} solicitou '${eventNameForLog}' para App ${payload.aplicacaoId}`,
    );

    try {
      const aplicacaoDto = await this.aplicacaoService.update(
        payload.aplicacaoId,
        novoEstadoApp,
        avaliador,
      );

      const broadcastPayloadAvaliador: EstadoAplicacaoAtualizadoPayloadAvaliador =
        {
          aplicacaoId: aplicacaoDto.id,
          novoEstado: aplicacaoDto.estado,
          novaDataFimISO: aplicacaoDto.dataFim,
        };

      const novoEstadoSubmissao = this.mapAplicacaoEstadoToSubmissaoEstado(
        aplicacaoDto.estado,
      );
      const broadcastPayloadSubmissao: EstadoAplicacaoAtualizadoPayloadSubmissao =
        {
          aplicacaoId: aplicacaoDto.id,
          novoEstado: novoEstadoSubmissao,
          novaDataFimISO: aplicacaoDto.dataFim,
        };

      const roomAvaliador = `avaliador_${avaliador.id}`;
      this.server
        .to(roomAvaliador)
        .emit('estado-aplicacao-atualizado', broadcastPayloadAvaliador);
      this.logger.log(
        `Evento 'estado-aplicacao-atualizado' (para ${eventNameForLog}) emitido para sala ${roomAvaliador}`,
      );

      this.submissaoGateway.emitEstadoAplicacaoAtualizadoToRoom(
        aplicacaoDto.id,
        broadcastPayloadSubmissao,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao processar '${eventNameForLog}' para App ${payload.aplicacaoId} por Avaliador ${avaliador.id}:`,
        error,
      );
      client.emit('erro-operacao', {
        message: `Erro ao ${eventNameForLog}: ${error || 'Erro interno.'}`,
      });
    }
  }

  @SubscribeMessage('ajustar-tempo-aplicacao')
  async handleAjustarTempo(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AjustarTempoPayload,
  ): Promise<void> {
    const avaliador = this.clientToAvaliadorMap.get(client.id);
    if (avaliador === undefined) {
      this.logger.warn(
        `Cliente ${client.id} não autenticado tentou ajustar tempo.`,
      );
      client.emit('erro-operacao', { message: 'Não autorizado.' });
      return;
    }

    this.logger.log(
      `Avaliador ${avaliador.id} solicitou ajuste de tempo para App ${payload.aplicacaoId}: ${payload.segundos}s`,
    );

    try {
      const aplicacaoAtualizada =
        await this.aplicacaoService.ajustarTempoAplicacao(
          payload.aplicacaoId,
          payload.segundos,
          avaliador.id,
        );

      const broadcastPayload: TempoAjustadoPayload = {
        aplicacaoId: aplicacaoAtualizada.id,
        novaDataFimISO: aplicacaoAtualizada.dataFim.toISOString(),
      };

      const roomAvaliador = `avaliador_${avaliador.id}`;
      this.server.to(roomAvaliador).emit('tempo-ajustado', broadcastPayload);
      this.logger.log(
        `Evento 'tempo-ajustado' emitido para sala ${roomAvaliador}`,
      );

      this.submissaoGateway.emitTempoAjustadoToAplicacaoRoom(
        aplicacaoAtualizada.id,
        broadcastPayload,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao ajustar tempo para App ${payload.aplicacaoId} por Avaliador ${avaliador.id}:`,
        error,
      );
      client.emit('erro-operacao', {
        message: `Erro ao ajustar tempo: ${error || 'Erro interno.'}`,
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('reiniciar-timer-aplicacao')
  async handleReiniciarTimer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReiniciarTimerPayload,
  ): Promise<void> {
    const avaliador = this.clientToAvaliadorMap.get(client.id);
    if (avaliador === undefined) {
      this.logger.warn(
        `Cliente ${client.id} não autenticado tentou reiniciar timer.`,
      );
      client.emit('erro-operacao', { message: 'Não autorizado.' });
      return;
    }

    this.logger.log(
      `Avaliador ${avaliador.id} solicitou reinício do timer para App ${payload.aplicacaoId}`,
    );

    try {
      const aplicacaoAtualizada =
        await this.aplicacaoService.reiniciarTimerAplicacao(
          payload.aplicacaoId,
          avaliador.id,
        );

      const broadcastPayload: TempoAjustadoPayload = {
        aplicacaoId: aplicacaoAtualizada.id,
        novaDataFimISO: aplicacaoAtualizada.dataFim.toISOString(),
      };

      const roomAvaliador = `avaliador_${avaliador.id}`;
      this.server.to(roomAvaliador).emit('tempo-ajustado', broadcastPayload);
      this.logger.log(
        `Evento 'tempo-ajustado' (após reinício) emitido para sala ${roomAvaliador}`,
      );

      this.submissaoGateway.emitTempoAjustadoToAplicacaoRoom(
        aplicacaoAtualizada.id,
        broadcastPayload,
      );
      this.logger.log(
        `Evento 'tempo-ajustado' (após reinício) emitido via SubmissaoGateway para sala aplicacao_${aplicacaoAtualizada.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao reiniciar timer para App ${payload.aplicacaoId} por Avaliador ${avaliador.id}:`,
        error,
      );
      client.emit('erro-operacao', {
        message: `Erro ao reiniciar timer: ${error || 'Erro interno.'}`,
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('pausar-aplicacao')
  async handlePausarAplicacao(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AplicacaoIdPayload,
  ) {
    await this.handleEstadoChange(
      client,
      payload,
      EstadoAplicacaoEnum.PAUSADA,
      'pausar-aplicacao',
    );
  }

  @SubscribeMessage('retomar-aplicacao')
  async handleRetomarAplicacao(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AplicacaoIdPayload,
  ) {
    await this.handleEstadoChange(
      client,
      payload,
      EstadoAplicacaoEnum.EM_ANDAMENTO,
      'retomar-aplicacao',
    );
  }

  @SubscribeMessage('finalizar-aplicacao')
  async handleFinalizarAplicacao(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AplicacaoIdPayload,
  ) {
    await this.handleEstadoChange(
      client,
      payload,
      EstadoAplicacaoEnum.FINALIZADA,
      'finalizar-aplicacao',
    );
  }
}
