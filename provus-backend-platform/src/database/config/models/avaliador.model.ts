import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemSistemaArquivosModel } from './item-sistema-arquivos.model';
import { AvaliadorResponse } from 'src/http/models/avaliador.response';

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

  static fromModel(model: AvaliadorModel): AvaliadorResponse {
    const response = new AvaliadorResponse();
    response.id = model.id;
    response.nome = model.nome;
    response.email = model.email;
    response.criadoEm = model.criadoEm;
    response.atualizadoEm = model.atualizadoEm;

    return response;
  }
}
