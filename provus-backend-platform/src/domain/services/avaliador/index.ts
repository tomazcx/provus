import { Avaliador } from 'src/domain/entities';
import { UpdateAvaliadorDto } from './dto/request';

export abstract class AvaliadorService {
  abstract findById(id: number): Promise<Avaliador>;
  abstract update(id: number, dto: UpdateAvaliadorDto): Promise<Avaliador>;
}
