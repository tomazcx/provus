import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AvaliadorRepository } from 'src/data/protocols/database';
import { Avaliador } from 'src/domain/entities';
import { AvaliadorService } from 'src/domain/services';
import { UpdateAvaliadorDto } from 'src/domain/services/avaliador/dto/request';
import * as bcrypt from 'bcrypt';
import { Env } from 'src/shared/env';

@Injectable()
export class AvaliadorServiceImpl implements AvaliadorService {
  constructor(private readonly avaliadorRepository: AvaliadorRepository) {}

  async findById(id: number): Promise<Avaliador> {
    const avaliador = await this.avaliadorRepository.findById(id);

    if (!avaliador) {
      throw new NotFoundException('Avaliador não encontrado');
    }

    return avaliador;
  }

  async update(id: number, dto: UpdateAvaliadorDto): Promise<Avaliador> {
    const avaliador = await this.avaliadorRepository.findById(id);

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
