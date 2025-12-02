import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from 'src/shared/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: Env.DATABASE_URL,
      entities: [__dirname + '/models/*.model{.ts,.js}'],
      migrationsRun: true,
      synchronize: false,
      ssl: Env.DATABASE_URL.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
    }),
  ],
})
export class DatabaseConfigModule {}
