import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.module';
import { AvaliadorService } from './avaliador.service';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { ItemSistemaArquivosService } from './item-sistema-arquivos.service';
import { QuestaoService } from './questao.service';

@Module({
  imports: [ProvidersModule, DatabaseModule],
  providers: [
    AuthService,
    AvaliadorService,
    QuestaoService,
    ItemSistemaArquivosService,
  ],
  exports: [
    AuthService,
    AvaliadorService,
    QuestaoService,
    ItemSistemaArquivosService,
  ],
})
export class ServiceModule {}
