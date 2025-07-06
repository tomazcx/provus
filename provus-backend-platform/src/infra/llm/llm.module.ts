import { Module } from '@nestjs/common';
import { LLMProvider } from 'src/data/protocols/llm';
import { LLMProviderImpl } from './provider';
@Module({
  providers: [
    {
      provide: LLMProvider,
      useClass: LLMProviderImpl,
    },
  ],
  exports: [LLMProvider],
})
export class LLMModule {}
