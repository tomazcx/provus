import { Module } from '@nestjs/common';
import { NotificationProvider } from 'src/data/protocols/notification';
import { NotificationImpl } from '.';
import { Env } from 'src/shared/env';

@Module({
  providers: [
    {
      provide: NotificationProvider,
      useFactory: () => {
        return new NotificationImpl({
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
  exports: [NotificationProvider],
})
export class NotificationsModule {}
