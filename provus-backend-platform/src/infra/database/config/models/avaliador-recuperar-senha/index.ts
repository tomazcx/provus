import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('avaliador_recuperar_senha')
export class AvaliadorRecuperarSenhaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  hash: string;

  @Column({
    name: 'expira_em',
    type: 'timestamp',
  })
  expiraEm: Date;

  @Column({
    name: 'criado_em',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date;
}
