import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AvaliadorGateway } from 'src/gateway/gateways/avaliador.gateway';
import { Env } from 'src/shared/env';

interface EmailSmtpConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class NotificationProvider {
  constructor(
    private readonly emailSmtpConfig: EmailSmtpConfig,
    private readonly avaliadorGateway: AvaliadorGateway,
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const transporter = nodemailer.createTransport(this.emailSmtpConfig);

    await transporter.sendMail({
      from: Env.SMTP_MAIL_FROM,
      to,
      subject,
      html: body,
    });
  }

  async sendNotificationViaSocket<T extends object>(
    avaliadorId: number,
    message: T,
  ): Promise<void> {
    await this.avaliadorGateway.sendMessageToAvaliador(avaliadorId, message);
  }
}
