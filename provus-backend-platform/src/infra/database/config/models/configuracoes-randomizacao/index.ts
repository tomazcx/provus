import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DificuldadeRandomizacaoEnum } from 'src/domain/enums/dificuldade-randomizacao.enum';
import TipoRandomizacaoEnum from 'src/domain/enums/tipo-randomizacao.enum';
import { QuestaoModel } from '../questao';

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

  @ManyToMany(
    () => QuestaoModel,
    (questao) => questao.configuracoesRandomizacao,
  )
  poolDeQuestoes: QuestaoModel[];
}
