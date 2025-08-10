import { Avaliador } from 'src/domain/entities';
import { CreateAvaliadorDto } from './dto';

export abstract class AvaliadorRepository {
  abstract create(dto: CreateAvaliadorDto): Promise<Avaliador>;
  abstract save(avaliador: Avaliador): Promise<void>;
  abstract findByEmail(email: string): Promise<Avaliador | null>;
  abstract findById(id: number): Promise<Avaliador | null>;
}
