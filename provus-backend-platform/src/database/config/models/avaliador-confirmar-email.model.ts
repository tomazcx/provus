import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('avaliador_confirmar_email')
export class AvaliadorConfirmarEmailModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', {
    name: 'avaliador_id',
  })
  avaliadorId: number;

  @Column()
  hash: string;

  @Column('boolean', {
    name: 'is_confirmado',
  })
  isConfirmado: boolean;

  @Column('timestamp', {
    name: 'expira_em',
  })
  expiraEm: Date;

  @Column({
    name: 'criado_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;
}
