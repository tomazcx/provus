import { Proctor } from 'src/domain/entities';
import { SignUpDto } from './dto';

export abstract class AuthService {
  abstract signUp(dto: SignUpDto): Promise<Proctor>;
}
