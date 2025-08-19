import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PunicaoPorOcorrenciaModel } from './punicao-por-ocorrencia.model';
import { ConfiguracaoNotificacaoModel } from './configuracao-notificacao.model';
import { IpsPermitidosModel } from './ips-permitidos.model';

@Entity('configuracoes_seguranca')
export class ConfiguracoesSegurancaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proibir_trocar_abas' })
  proibirTrocarAbas: boolean;

  @Column({ name: 'proibir_print_screen' })
  proibirPrintScreen: boolean;

  @Column({ name: 'proibir_copiar_colar' })
  proibirCopiarColar: boolean;

  @Column({ name: 'proibir_devtools' })
  proibirDevtools: boolean;

  @Column({ name: 'quantidade_tentativas' })
  quantidadeTentativas: number;

  @Column({ name: 'quantidade_acessos_simultaneos' })
  quantidadeAcessosSimultaneos: number;

  @Column({ name: 'ativar_controle_ip' })
  ativarControleIp: boolean;

  @Column({ name: 'duracao_alertas' })
  duracaoAlertas: number;

  @Column({ name: 'permitir_fechar_alertas' })
  permitirFecharAlertas: boolean;

  @Column({ name: 'ativar_correcao_discursiva_via_ia' })
  ativarCorrecaoDiscursivaViaIa: boolean;

  @OneToMany(
    () => PunicaoPorOcorrenciaModel,
    (punicao) => punicao.configuracaoSeguranca,
    { cascade: true },
  )
  punicoes: PunicaoPorOcorrenciaModel[];

  @OneToMany(() => IpsPermitidosModel, (ip) => ip.configuracaoSeguranca, {
    cascade: true,
    eager: true,
  })
  ipsPermitidos: IpsPermitidosModel[];

  @OneToMany(
    () => ConfiguracaoNotificacaoModel,
    (notificacao) => notificacao.configuracaoSeguranca,
    { cascade: true, eager: true },
  )
  notificacoes: ConfiguracaoNotificacaoModel[];
}
