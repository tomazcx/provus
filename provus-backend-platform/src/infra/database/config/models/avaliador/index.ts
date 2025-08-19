import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';

@Entity('avaliador')
export class AvaliadorModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToMany(() => ItemSistemaArquivosModel, (item) => item.avaliador)
  itemSistemaArquivos: ItemSistemaArquivosModel[];
}
