import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ConfiguracoesSegurancaModel } from './configuracoes-seguranca.model';

@Entity('ips_permitidos')
export class IpsPermitidosModel {
  @PrimaryColumn()
  ip: string;

  @PrimaryColumn({ name: 'configuracoes_seguranca_id' })
  configuracoesSegurancaId: number;

  @ManyToOne(
    () => ConfiguracoesSegurancaModel,
    (config) => config.ipsPermitidos,
  )
  @JoinColumn({ name: 'configuracoes_seguranca_id' })
  configuracaoSeguranca: ConfiguracoesSegurancaModel;
}
