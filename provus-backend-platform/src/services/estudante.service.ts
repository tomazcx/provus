import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstudanteModel } from 'src/database/config/models/estudante.model';
import { Repository } from 'typeorm';

@Injectable()
export class EstudanteService {
  constructor(
    @InjectRepository(EstudanteModel)
    private readonly estudanteRepository: Repository<EstudanteModel>,
  ) {}

  createInstance(payload: { nome: string; email: string }): EstudanteModel {
    return this.estudanteRepository.create({
      nome: payload.nome,
      email: payload.email,
    });
  }
}
