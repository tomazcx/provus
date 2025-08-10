import { Module } from '@nestjs/common';
import { JwtProvider } from 'src/data/protocols/jwt';
import { JwtProviderImpl } from './index';

@Module({
  providers: [
    {
      provide: JwtProvider,
      useClass: JwtProviderImpl,
    },
  ],
  exports: [JwtProvider],
})
export class JwtModule {}
