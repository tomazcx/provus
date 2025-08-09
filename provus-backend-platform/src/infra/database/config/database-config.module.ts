import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorModel, AvaliadorRecuperarSenhaModel } from './models';
import { Env } from 'src/shared/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: Env.DATABASE_URL,
      entities: [AvaliadorModel, AvaliadorRecuperarSenhaModel],
    }),
  ],
})
export class DatabaseConfigModule {}
