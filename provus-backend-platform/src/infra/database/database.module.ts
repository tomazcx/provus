import { Module } from '@nestjs/common';
import { ProctorRepository } from 'src/data/protocols/database';
import { ProctorTypeORMRepository } from './repositories';
import { ProctorModel } from './config/models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProctorModel])],
  providers: [
    {
      provide: ProctorRepository,
      useClass: ProctorTypeORMRepository,
    },
  ],
  exports: [ProctorRepository],
})
export class DatabaseModule {}
