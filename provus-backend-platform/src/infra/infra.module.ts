import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DatabaseConfigModule } from './database/config/database-config.module';

@Module({
  imports: [DatabaseModule, DatabaseConfigModule],
  exports: [DatabaseModule, DatabaseConfigModule],
})
export class InfraModule {}
