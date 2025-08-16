import { AvaliadorConfirmarEmail } from 'src/domain/entities';
import { CreateAvaliadorConfirmarEmailDto } from './dto';

export abstract class AvaliadorConfirmarEmailRepository {
  abstract save(data: AvaliadorConfirmarEmail): Promise<void>;
  abstract create(
    dto: CreateAvaliadorConfirmarEmailDto,
  ): Promise<AvaliadorConfirmarEmail>;
  abstract findByHash(hash: string): Promise<AvaliadorConfirmarEmail>;
  abstract findByAvaliadorId(
    avaliadorId: number,
  ): Promise<AvaliadorConfirmarEmail>;
}
