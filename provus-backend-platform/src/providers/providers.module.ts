import { Module } from '@nestjs/common';
import { JwtProvider } from './jwt.provider';
import { EmailTemplatesProvider } from './email-templates.provider';
import { NotificationProvider } from './notification.provider';
import { Env } from 'src/shared/env';

@Module({
  providers: [
    JwtProvider,
    EmailTemplatesProvider,
    {
      provide: NotificationProvider,
      useFactory: () => {
        return new NotificationProvider({
          host: Env.SMTP_HOST,
          port: Env.SMTP_PORT,
          auth: {
            user: Env.SMTP_USER,
            pass: Env.SMTP_PASS,
          },
        });
      },
    },
  ],
  exports: [JwtProvider, EmailTemplatesProvider, NotificationProvider],
})
export class ProvidersModule {}
