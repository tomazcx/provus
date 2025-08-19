import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestaoModel } from './questao.model';
import DificuldadeRandomizacaoEnum from 'src/domain/enums/dificuldade-randomizacao.enum';
import TipoRandomizacaoEnum from 'src/domain/enums/tipo-randomizacao.enum';
import { ConfiguracoesGeraisModel } from './configuracoes-gerais.model';

@Entity('configuracoes_randomizacao')
export class ConfiguracoesRandomizacaoModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoRandomizacaoEnum })
  tipo: TipoRandomizacaoEnum;

  @Column({ type: 'enum', enum: DificuldadeRandomizacaoEnum })
  dificuldade: DificuldadeRandomizacaoEnum;

  @Column()
  quantidade: number;

  @ManyToOne(
    () => ConfiguracoesGeraisModel,
    (configuracao) => configuracao.configuracoesRandomizacao,
  )
  @JoinColumn({ name: 'configuracoes_gerais_id' })
  configuracoesGerais: ConfiguracoesGeraisModel;

  @ManyToMany(
    () => QuestaoModel,
    (questao) => questao.configuracoesRandomizacao,
  )
  poolDeQuestoes: QuestaoModel[];
}
