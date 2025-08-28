import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { AvaliadorModel } from './avaliador.model';
import { ItemSistemaArquivosModel } from './item-sistema-arquivos.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';

@Entity('banco_de_conteudo')
export class BancoDeConteudoModel {
  @PrimaryColumn({ type: 'enum', enum: TipoBancoEnum, name: 'tipo_banco' })
  tipoBanco: TipoBancoEnum;

  @PrimaryColumn({ name: 'avaliador_id' })
  avaliadorId: number;

  @ManyToOne(() => AvaliadorModel)
  @JoinColumn({ name: 'avaliador_id' })
  avaliador: AvaliadorModel;

  @OneToOne(() => ItemSistemaArquivosModel, { eager: true })
  @JoinColumn({ name: 'pasta_raiz_id' })
  pastaRaiz: ItemSistemaArquivosModel;
}
