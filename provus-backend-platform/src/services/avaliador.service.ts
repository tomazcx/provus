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

@Injectable()
export class AvaliadorService {
  constructor(
    @InjectRepository(AvaliadorModel)
    private readonly avaliadorRepository: Repository<AvaliadorModel>,
  ) {}

  async findById(id: number): Promise<AvaliadorModel> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { id },
    });

    if (!avaliador) {
      throw new NotFoundException('Avaliador não encontrado');
    }

    return avaliador;
  }

  async update(id: number, dto: UpdateAvaliadorDto): Promise<AvaliadorModel> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { id },
    });

    if (!avaliador) {
      throw new NotFoundException('Avaliador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, avaliador.senha);
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    if (dto.nome && dto.nome.trim() !== '') {
      avaliador.nome = dto.nome;
    }

    if (dto.novaSenha && dto.novaSenha.trim() !== '') {
      const salt = await bcrypt.genSalt(Env.HASH_SALT);
      const novaSenhaHash = await bcrypt.hash(dto.novaSenha, salt);
      avaliador.senha = novaSenhaHash;
    }

    await this.avaliadorRepository.save(avaliador);

    return avaliador;
  }
}
