import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from 'src/shared/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: Env.DATABASE_URL,
      entities: [__dirname + '/models/**/index{.ts,.js}'],
      migrationsRun: true,
      synchronize: false,
    }),
  ],
})
export class DatabaseConfigModule {}
