import { Injectable } from '@nestjs/common';
import { ProctorRepository } from 'src/data/protocols/database';
import { Repository } from 'typeorm';
import { ProctorModel } from '../../config/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Proctor } from 'src/domain/entities';

@Injectable()
export class ProctorTypeORMRepository implements ProctorRepository {
  constructor(
    @InjectRepository(ProctorModel)
    private readonly proctorRepository: Repository<ProctorModel>,
  ) {}

  async create(proctor: Proctor): Promise<Proctor> {
    const proctorModel = this.proctorRepository.create(proctor);
    const savedProctor = await this.proctorRepository.save(proctorModel);
    return savedProctor;
  }

  async findByEmail(email: string): Promise<Proctor | null> {
    return await this.proctorRepository.findOne({ where: { email } });
  }
}
