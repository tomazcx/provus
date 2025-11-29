import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PunicaoPorOcorrenciaModel } from './punicao-por-ocorrencia.model';
import { ConfiguracaoNotificacaoModel } from './configuracao-notificacao.model';

@Entity('configuracoes_seguranca')
export class ConfiguracoesSegurancaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proibir_trocar_abas' })
  proibirTrocarAbas: boolean;

  @Column({ name: 'proibir_copiar_colar' })
  proibirCopiarColar: boolean;

  @Column({ name: 'quantidade_tentativas' })
  quantidadeTentativas: number;

  @Column({ name: 'ativar_correcao_discursiva_via_ia' })
  ativarCorrecaoDiscursivaViaIa: boolean;

  @OneToMany(
    () => PunicaoPorOcorrenciaModel,
    (punicao) => punicao.configuracaoSeguranca,
    { cascade: true },
  )
  punicoes: PunicaoPorOcorrenciaModel[];

  @OneToMany(
    () => ConfiguracaoNotificacaoModel,
    (notificacao) => notificacao.configuracaoSeguranca,
    { cascade: true, eager: true },
  )
  notificacoes: ConfiguracaoNotificacaoModel[];
}
