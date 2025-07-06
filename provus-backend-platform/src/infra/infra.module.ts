import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DatabaseConfigModule } from './database/config/database-config.module';
import { LLMModule } from './llm/llm.module';

@Module({
  imports: [DatabaseModule, DatabaseConfigModule, LLMModule],
  exports: [DatabaseModule, DatabaseConfigModule, LLMModule],
})
export class InfraModule {}
