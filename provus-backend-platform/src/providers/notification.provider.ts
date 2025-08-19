import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
  constructor(private readonly emailSmtpConfig: EmailSmtpConfig) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const transporter = nodemailer.createTransport(this.emailSmtpConfig);

    await transporter.sendMail({
      from: Env.SMTP_MAIL_FROM,
      to,
      subject,
      html: body,
    });
  }
}
