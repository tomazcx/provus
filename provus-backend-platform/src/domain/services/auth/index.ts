import { Avaliador } from 'src/domain/entities';
import {
  LoginDto,
  RecoverPasswordDto,
  ResetPasswordDto,
  SignUpDto,
} from './dto/request';
import { LoginResultDto } from './dto/result';

export abstract class AuthService {
  abstract signUp(dto: SignUpDto): Promise<void>;
  abstract signIn(dto: LoginDto): Promise<LoginResultDto>;
  abstract recoverPassword(dto: RecoverPasswordDto): Promise<void>;
  abstract resetPassword(dto: ResetPasswordDto): Promise<void>;
  abstract validateToken(token: string): Promise<Avaliador>;
}
