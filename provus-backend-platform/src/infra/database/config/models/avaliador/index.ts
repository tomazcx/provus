import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('avaliador')
export class AvaliadorModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  senha: string;

  @Column({
    name: 'criado_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;

  @Column({
    name: 'atualizado_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  atualizadoEm: Date;
}
