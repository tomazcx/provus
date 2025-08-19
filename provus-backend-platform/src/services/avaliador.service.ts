import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Env } from 'src/shared/env';
import { InjectRepository } from '@nestjs/typeorm';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { Repository } from 'typeorm';
import { UpdateAvaliadorDto } from 'src/dto/request/avaliador/update-avaliador.dto';
import { Avaliador } from 'src/domain/entities/avaliador.entity';

@Injectable()
export class AvaliadorService {
  constructor(
    @InjectRepository(AvaliadorModel)
    private readonly avaliadorRepository: Repository<AvaliadorModel>,
  ) {}

  async findById(id: number): Promise<Avaliador> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { id },
    });

    if (!avaliador) {
      throw new NotFoundException('Avaliador não encontrado');
    }

    return avaliador;
  }

  async update(id: number, dto: UpdateAvaliadorDto): Promise<Avaliador> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { id },
    });

    if (!avaliador) {
      throw new NotFoundException('Avaliador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, avaliador.senha);

    if (!isPasswordValid) {
      throw new BadRequestException('Senha inválida');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const novaSenha = await bcrypt.hash(dto.novaSenha, salt);

    avaliador.nome = dto.nome;
    avaliador.senha = novaSenha;

    await this.avaliadorRepository.save(avaliador);

    return avaliador;
  }
}
