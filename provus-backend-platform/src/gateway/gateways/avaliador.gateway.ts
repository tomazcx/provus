import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { AuthService } from 'src/services/auth.service';

@Injectable()
@WebSocketGateway({
  namespace: '/avaliador',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class AvaliadorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AvaliadorGateway.name);
  private readonly connectedAvaliadores = new Map<number, Socket>();

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Avaliador tentando se conectar: ${client.id}`);

    try {
      const token = client.handshake.headers.authorization;

      if (!token) {
        this.logger.warn(
          `Tentativa de conexão sem token - Avaliador: ${client.id}`,
        );
        client.emit('erro-validacao', {
          message: 'Token de autenticação é obrigatório',
        });
        client.disconnect();
        return;
      }

      const splitToken = token.split(' ')[1];
      const avaliador = await this.authService.validateToken(splitToken);

      if (!avaliador) {
        this.logger.warn(`Token inválido - Avaliador: ${client.id}`);
        client.emit('erro-validacao', {
          message: 'Token de autenticação inválido',
        });
        client.disconnect();
        return;
      }

      this.connectedAvaliadores.set(avaliador.id, client);

      this.logger.log(`Avaliador conectado: ${client.id}`);

      client.emit('avaliador-conectado', {
        message: 'Avaliador conectado com sucesso',
      });
    } catch (error) {
      this.logger.error(`Erro ao conectar avaliador: ${client.id}`, error);
      client.emit('erro-validacao', {
        message: 'Erro ao conectar avaliador',
      });
      client.disconnect();
    }
  }

  async sendMessageToAvaliador<T extends object>(
    avaliadorId: number,
    message: T,
  ) {
    const socket = this.connectedAvaliadores.get(avaliadorId);
    if (socket) {
      socket.emit('punicao-por-ocorrencia', message);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [id, socket] of this.connectedAvaliadores) {
      if (socket.id === client.id) {
        this.connectedAvaliadores.delete(id);
        break;
      }
    }
  }
}
