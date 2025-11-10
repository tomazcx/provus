import { Module, forwardRef } from '@nestjs/common';
import { JwtProvider } from './jwt.provider';
import { EmailTemplatesProvider } from './email-templates.provider';
import { NotificationProvider } from './notification.provider';
import { StorageProvider } from './storage.provider';
import { Env } from 'src/shared/env';

import GeminiProvider from './ai/gemini.provider';
import { GatewayModule } from 'src/gateway/gateway.module';
import { AbstractAiProvider } from './ai/interface/ai-provider.abstract';

export const AI_PROVIDER = 'AI_PROVIDER';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  providers: [
    JwtProvider,
    EmailTemplatesProvider,
    StorageProvider,
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
    {
      provide: AbstractAiProvider,
      useClass: GeminiProvider,
    },
  ],
  exports: [
    JwtProvider,
    EmailTemplatesProvider,
    StorageProvider,
    NotificationProvider,
    AbstractAiProvider,
  ],
})
export class ProvidersModule {}
