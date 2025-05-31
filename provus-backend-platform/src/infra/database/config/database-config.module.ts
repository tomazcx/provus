import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProctorModel } from './models';
import { Env } from 'src/shared/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: Env.DATABASE_URL,
      entities: [ProctorModel],
    }),
  ],
})
export class DatabaseConfigModule {}
