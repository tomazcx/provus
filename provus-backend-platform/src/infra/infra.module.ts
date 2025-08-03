import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DatabaseConfigModule } from './database/config/database-config.module';
import { JwtModule } from './jwt/jwt.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseConfigModule,
    JwtModule,
    EmailTemplatesModule,
    NotificationsModule,
  ],
  exports: [
    DatabaseModule,
    DatabaseConfigModule,
    JwtModule,
    EmailTemplatesModule,
    NotificationsModule,
  ],
})
export class InfraModule {}
