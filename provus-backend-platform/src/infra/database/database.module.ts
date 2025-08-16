import { Module } from '@nestjs/common';
import {
  AvaliadorRepository,
  AvaliadorRecuperarSenhaRepository,
  AvaliadorConfirmarEmailRepository,
} from 'src/data/protocols/database';
import {
  AvaliadorTypeORMRepository,
  AvaliadorRecuperarSenhaTypeORMRepository,
  AvaliadorConfirmarEmailTypeORMRepository,
} from './repositories';
import { AvaliadorModel } from './config/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorRecuperarSenhaModel } from './config/models/avaliador-recuperar-senha';
import { AvaliadorConfirmarEmailModel } from './config/models/avaliador-confirmar-email';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvaliadorModel,
      AvaliadorRecuperarSenhaModel,
      AvaliadorConfirmarEmailModel,
    ]),
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
    {
      provide: AvaliadorConfirmarEmailRepository,
      useClass: AvaliadorConfirmarEmailTypeORMRepository,
    },
  ],
  exports: [
    AvaliadorRepository,
    AvaliadorRecuperarSenhaRepository,
    AvaliadorConfirmarEmailRepository,
  ],
})
export class DatabaseModule {}
