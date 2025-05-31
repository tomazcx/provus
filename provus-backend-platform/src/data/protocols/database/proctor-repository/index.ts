import { Proctor } from 'src/domain/entities';
import { CreateProctorDto } from './dto';

export abstract class ProctorRepository {
  abstract create(dto: CreateProctorDto): Promise<Proctor>;
  abstract findByEmail(email: string): Promise<Proctor | null>;
}
