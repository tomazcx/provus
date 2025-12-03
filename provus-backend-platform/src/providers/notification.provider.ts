import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AvaliadorGateway } from 'src/gateway/gateways/avaliador.gateway';
import { SubmissaoGateway } from 'src/gateway/gateways/submissao.gateway';

interface SmtpConfig {
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
  rateLimit?: number;
  secure?: boolean;
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class NotificationProvider {
  private readonly logger = new Logger(NotificationProvider.name);
  private transporter: nodemailer.Transporter;
  private avaliadorGateway: AvaliadorGateway | null = null;
  private submissaoGateway: SubmissaoGateway | null = null;

  constructor(smtpConfig: SmtpConfig) {
    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  setSubmissaoGateway(gateway: SubmissaoGateway) {
    this.submissaoGateway = gateway;
  }

  setAvaliadorGateway(gateway: AvaliadorGateway) {
    this.avaliadorGateway = gateway;
    this.logger.log('AvaliadorGateway configurado no NotificationProvider');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.transporter.options['auth']['user'],
        to,
        subject,
        html,
      });
      this.logger.log(`Email enviado para ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${to}:`, error);
      throw error;
    }
  }

  sendNotificationToStudent(hashSubmissao: string, event: string, data: any) {
    if (this.submissaoGateway) {
      this.submissaoGateway.notifyStudent(hashSubmissao, event, data);
    }
  }

  sendNotificationViaSocket<T extends object>(
    avaliadorId: number,
    eventName: string,
    data: T,
  ): void {
    if (!this.avaliadorGateway) {
      this.logger.warn(
        `AvaliadorGateway não disponível. Não foi possível enviar notificação via socket para avaliador ${avaliadorId}, evento: ${eventName}`,
      );
      return;
    }

    try {
      this.avaliadorGateway.sendMessageToAvaliador(
        avaliadorId,
        eventName,
        data,
      );
      this.logger.log(
        `Notificação via socket enviada para avaliador ${avaliadorId}, evento: ${eventName}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação via socket para avaliador ${avaliadorId}:`,
        error,
      );
    }
  }
}
