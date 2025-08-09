import { Injectable } from '@nestjs/common';
import { AvaliadorRepository } from 'src/data/protocols/database';
import { Repository } from 'typeorm';
import { AvaliadorModel } from '../../config/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Avaliador } from 'src/domain/entities';
import { CreateAvaliadorDto } from 'src/data/protocols/database/avaliador-repository/dto';

@Injectable()
export class AvaliadorTypeORMRepository implements AvaliadorRepository {
  constructor(
    @InjectRepository(AvaliadorModel)
    private readonly avaliadorRepository: Repository<AvaliadorModel>,
  ) {}

  async create(dto: CreateAvaliadorDto): Promise<Avaliador> {
    const avaliadorModel = this.avaliadorRepository.create(dto);
    const savedAvaliador = await this.avaliadorRepository.save(avaliadorModel);

    return savedAvaliador;
  }

  async save(avaliador: Avaliador): Promise<void> {
    await this.avaliadorRepository.save(avaliador);
  }

  async findByEmail(email: string): Promise<Avaliador | null> {
    return await this.avaliadorRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Avaliador | null> {
    return await this.avaliadorRepository.findOne({ where: { id } });
  }
}
