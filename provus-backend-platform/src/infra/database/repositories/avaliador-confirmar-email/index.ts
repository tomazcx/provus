import { AvaliadorConfirmarEmailRepository } from 'src/data/protocols/database';
import { AvaliadorConfirmarEmailModel } from 'src/infra/database/config/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAvaliadorConfirmarEmailDto } from 'src/data/protocols/database/avaliador-confirmar-email-repository/dto';
import { AvaliadorConfirmarEmail } from 'src/domain/entities';

@Injectable()
export class AvaliadorConfirmarEmailTypeORMRepository
  implements AvaliadorConfirmarEmailRepository
{
  constructor(
    @InjectRepository(AvaliadorConfirmarEmailModel)
    private readonly avaliadorConfirmarEmailModel: Repository<AvaliadorConfirmarEmailModel>,
  ) {}

  async create(
    dto: CreateAvaliadorConfirmarEmailDto,
  ): Promise<AvaliadorConfirmarEmail> {
    const avaliadorConfirmarEmail =
      this.avaliadorConfirmarEmailModel.create(dto);

    return this.avaliadorConfirmarEmailModel.save(avaliadorConfirmarEmail);
  }

  async findByAvaliadorId(
    avaliadorId: number,
  ): Promise<AvaliadorConfirmarEmail> {
    return this.avaliadorConfirmarEmailModel.findOne({
      where: { avaliadorId },
    });
  }

  async findByHash(hash: string): Promise<AvaliadorConfirmarEmail> {
    return this.avaliadorConfirmarEmailModel.findOne({
      where: { hash },
    });
  }

  async save(data: AvaliadorConfirmarEmail): Promise<void> {
    await this.avaliadorConfirmarEmailModel.save(data);
  }
}
