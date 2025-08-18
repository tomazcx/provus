import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ConfiguracoesSegurancaModel } from '../configuracoes-seguranca';
import TipoNotificacaoEnum from 'src/domain/enums/tipo-notificacao.enum';

@Entity('configuracao_notificacao')
export class ConfiguracaoNotificacaoModel {
  @PrimaryColumn({
    type: 'enum',
    enum: TipoNotificacaoEnum,
    name: 'tipo_notificacao',
  })
  tipoNotificacao: TipoNotificacaoEnum;

  @PrimaryColumn({ name: 'configuracoes_seguranca_id' })
  configuracoesSegurancaId: number;

  @ManyToOne(() => ConfiguracoesSegurancaModel, (config) => config.notificacoes)
  @JoinColumn({ name: 'configuracoes_seguranca_id' })
  configuracaoSeguranca: ConfiguracoesSegurancaModel;
}
