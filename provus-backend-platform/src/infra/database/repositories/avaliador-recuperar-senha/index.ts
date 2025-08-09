import { Injectable } from '@nestjs/common';
import { AvaliadorRecuperarSenhaRepository } from 'src/data/protocols/database';
import { AvaliadorRecuperarSenhaModel } from '../../config/models/avaliador-recuperar-senha';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAvaliadorRecuperarSenhaDTO } from 'src/data/protocols/database/avaliador-recuperar-senha-repository/dto';
import { AvaliadorRecuperarSenha } from 'src/domain/entities';

@Injectable()
export class AvaliadorRecuperarSenhaTypeORMRepository
  implements AvaliadorRecuperarSenhaRepository
{
  constructor(
    @InjectRepository(AvaliadorRecuperarSenhaModel)
    private readonly avaliadorRecuperarSenhaRepository: Repository<AvaliadorRecuperarSenhaModel>,
  ) {}

  async create(
    dto: CreateAvaliadorRecuperarSenhaDTO,
  ): Promise<AvaliadorRecuperarSenha> {
    const avaliadorRecuperarSenha =
      this.avaliadorRecuperarSenhaRepository.create(dto);
    return this.avaliadorRecuperarSenhaRepository.save(avaliadorRecuperarSenha);
  }

  async findByHash(hash: string): Promise<AvaliadorRecuperarSenha | null> {
    return this.avaliadorRecuperarSenhaRepository.findOne({
      where: { hash },
    });
  }

  async delete(id: number): Promise<void> {
    await this.avaliadorRecuperarSenhaRepository.delete(id);
  }
}
