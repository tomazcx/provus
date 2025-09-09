import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AvaliacaoModel } from './avaliacao.model';
import { ArquivoModel } from './arquivo.model';

@Entity('arquivos_avaliacoes')
export class ArquivosAvaliacoesModel {
  @PrimaryColumn({ name: 'avaliacao_id' })
  avaliacaoId: number;

  @PrimaryColumn({ name: 'arquivo_id' })
  arquivoId: number;

  @Column({ name: 'permitir_consulta_por_estudante' })
  permitirConsultaPorEstudante: boolean;

  @ManyToOne(() => AvaliacaoModel, (avaliacao) => avaliacao.arquivos)
  @JoinColumn({ name: 'avaliacao_id' })
  avaliacao: AvaliacaoModel;

  @ManyToOne(() => ArquivoModel, (arquivo) => arquivo.avaliacoes)
  @JoinColumn({ name: 'arquivo_id' })
  arquivo: ArquivoModel;
}
