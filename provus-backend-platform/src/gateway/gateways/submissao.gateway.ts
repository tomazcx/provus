import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PunicaoPorOcorrenciaMessage } from '../messages/punicao-por-ocorrencia.message';
import { SubmissaoService } from 'src/services/submissao.service';

interface SubmissaoConnectionData {
  submissaoId: number;
  estudanteEmail: string;
  clientId: string;
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
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Aluno tentando se conectar para avaliação: ${client.id}`);

    try {
      const hash = client.handshake.query.hash as string;

      if (!hash) {
        this.logger.warn(`Tentativa de conexão sem hash - Aluno: ${client.id}`);
        client.emit('erro-validacao', {
          message: 'Hash da submissão é obrigatório',
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
        error.stack,
      );

      client.emit('erro-validacao', {
        message: 'Erro interno do servidor',
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('registrar-punicao-por-ocorrencia')
  async handleMessage(client: Socket, data: PunicaoPorOcorrenciaMessage) {
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

  handleDisconnect(client: Socket) {
    this.logger.log(`Aluno desconectado: ${client.id}`);

    this.connectedClients.forEach((connections, hash) => {
      const updatedConnections = connections.filter(
        (connection) => connection.clientId !== client.id,
      );

      if (updatedConnections.length === 0) {
        this.connectedClients.delete(hash);
      } else {
        this.connectedClients.set(hash, updatedConnections);
      }
    });
  }

  disconnectClient(clientId: string) {
    const client = this.server.sockets.sockets.get(clientId);
    this.logger.log(`Aluno desconectado: ${clientId}`);
    if (client) {
      client.disconnect();
    }
  }
}
