import { AvaliadorRecuperarSenha } from 'src/domain/entities';
import { CreateAvaliadorRecuperarSenhaDTO } from './dto';

export abstract class AvaliadorRecuperarSenhaRepository {
  abstract create(
    dto: CreateAvaliadorRecuperarSenhaDTO,
  ): Promise<AvaliadorRecuperarSenha>;
  abstract findByHash(hash: string): Promise<AvaliadorRecuperarSenha | null>;
  abstract delete(id: number): Promise<void>;
}
