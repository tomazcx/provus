import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConfiguracoesGeraisModel } from './configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from './configuracoes-seguranca.model';

@Entity('configuracao_avaliacao')
export class ConfiguracaoAvaliacaoModel {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ConfiguracoesGeraisModel, { cascade: true, eager: true })
  @JoinColumn({ name: 'configuracoes_gerais_id' })
  configuracoesGerais: ConfiguracoesGeraisModel;

  @OneToOne(() => ConfiguracoesSegurancaModel, { cascade: true, eager: true })
  @JoinColumn({ name: 'configuracoes_seguranca_id' })
  configuracoesSeguranca: ConfiguracoesSegurancaModel;
}
