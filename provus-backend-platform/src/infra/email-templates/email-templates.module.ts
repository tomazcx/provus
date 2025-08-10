import { Module } from '@nestjs/common';
import { EmailTemplatesProvider } from 'src/data/protocols/email-templates';
import { EmailTemplatesImpl } from './index';

@Module({
  providers: [
    {
      provide: EmailTemplatesProvider,
      useClass: EmailTemplatesImpl,
    },
  ],
  exports: [EmailTemplatesProvider],
})
export class EmailTemplatesModule {}
