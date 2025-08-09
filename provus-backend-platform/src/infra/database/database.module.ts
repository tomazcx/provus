import { Module } from '@nestjs/common';
import {
  AvaliadorRepository,
  AvaliadorRecuperarSenhaRepository,
} from 'src/data/protocols/database';
import {
  AvaliadorTypeORMRepository,
  AvaliadorRecuperarSenhaTypeORMRepository,
} from './repositories';
import { AvaliadorModel } from './config/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorRecuperarSenhaModel } from './config/models/avaliador-recuperar-senha';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvaliadorModel, AvaliadorRecuperarSenhaModel]),
  ],
  providers: [
    {
      provide: AvaliadorRepository,
      useClass: AvaliadorTypeORMRepository,
    },
    {
      provide: AvaliadorRecuperarSenhaRepository,
      useClass: AvaliadorRecuperarSenhaTypeORMRepository,
    },
  ],
  exports: [AvaliadorRepository, AvaliadorRecuperarSenhaRepository],
})
export class DatabaseModule {}
