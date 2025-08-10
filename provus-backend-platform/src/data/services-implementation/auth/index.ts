import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AvaliadorRecuperarSenhaRepository,
  AvaliadorRepository,
} from 'src/data/protocols/database';
import { EmailTemplatesProvider } from 'src/data/protocols/email-templates';
import { NotificationProvider } from 'src/data/protocols/notification';
import { JwtProvider } from 'src/data/protocols/jwt';
import { AuthService } from 'src/domain/services';
import * as bcrypt from 'bcrypt';
import { Env } from 'src/shared/env';
import {
  LoginDto,
  RecoverPasswordDto,
  ResetPasswordDto,
  SignUpDto,
} from 'src/domain/services/auth/dto/request';
import { LoginResultDto } from 'src/domain/services/auth/dto/result';
import { v4 as uuid } from 'uuid';
import { Avaliador } from 'src/domain/entities';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly avaliadorRepository: AvaliadorRepository,
    private readonly jwtProvider: JwtProvider,
    private readonly avaliadorRecuperarSenhaRepository: AvaliadorRecuperarSenhaRepository,
    private readonly emailTemplatesProvider: EmailTemplatesProvider,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const emailExists = await this.avaliadorRepository.findByEmail(dto.email);

    if (emailExists) {
      throw new ConflictException('Email já cadastrado');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const senha = await bcrypt.hash(dto.senha, salt);

    await this.avaliadorRepository.create({
      nome: dto.nome,
      email: dto.email,
      senha,
    });
  }

  async signIn(dto: LoginDto): Promise<LoginResultDto> {
    const avaliador = await this.avaliadorRepository.findByEmail(dto.email);

    if (!avaliador) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, avaliador.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const token = await this.jwtProvider.sign({ id: avaliador.id });

    return {
      token,
    };
  }

  async recoverPassword(dto: RecoverPasswordDto): Promise<void> {
    const avaliador = await this.avaliadorRepository.findByEmail(dto.email);

    if (!avaliador) {
      return;
    }

    const hash = uuid();

    const twentyFourHours = 1000 * 60 * 60 * 24;

    const avaliadorRecuperarSenha =
      await this.avaliadorRecuperarSenhaRepository.create({
        email: dto.email,
        hash,
        expiraEm: new Date(Date.now() + twentyFourHours),
      });

    const url = `${Env.FRONTEND_URL}/recuperar-senha/${avaliadorRecuperarSenha.hash}`;

    const html = this.emailTemplatesProvider.recoverPassword(url);

    await this.notificationProvider.sendEmail(
      dto.email,
      'Provus -Recuperação de Senha',
      html,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const avaliadorRecuperarSenha =
      await this.avaliadorRecuperarSenhaRepository.findByHash(dto.hash);

    if (!avaliadorRecuperarSenha) {
      throw new ForbiddenException('Não autorizado');
    }

    if (avaliadorRecuperarSenha.expiraEm < new Date()) {
      throw new ForbiddenException('Não autorizado');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const senha = await bcrypt.hash(dto.senha, salt);

    const avaliador = await this.avaliadorRepository.findByEmail(
      avaliadorRecuperarSenha.email,
    );

    if (!avaliador) {
      throw new ForbiddenException('Não autorizado');
    }

    avaliador.senha = senha;

    await this.avaliadorRepository.save(avaliador);

    await this.avaliadorRecuperarSenhaRepository.delete(
      avaliadorRecuperarSenha.id,
    );
  }

  async validateToken(token: string): Promise<Avaliador> {
    try {
      const decoded = await this.jwtProvider.verify(token);

      if (!decoded) {
        return null;
      }

      const decodedToken = decoded as { id: number };

      return await this.avaliadorRepository.findById(decodedToken.id);
    } catch (error) {
      return null;
    }
  }
}
