import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtProvider } from 'src/providers/jwt.provider';
import { EmailTemplatesProvider } from 'src/providers/email-templates.provider';
import { NotificationProvider } from 'src/providers/notification.provider';
import { Env } from 'src/shared/env';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/dto/request/auth/sign-up.dto';
import { ConfirmEmailDto } from 'src/dto/request/auth/confirm-email.dto';
import { SignInResultDto } from 'src/dto/result/auth/sign-in.result';
import { SignInDto } from 'src/dto/request/auth/sign-in.dto';
import { ResetPasswordDto } from 'src/dto/request/auth/reset-password.dto';
import { RecoverPasswordDto } from 'src/dto/request/auth/recover-password.dto';
import { AvaliadorRecuperarSenhaModel } from 'src/database/config/models/avaliador-recuperar-senha.model';
import { AvaliadorConfirmarEmailModel } from 'src/database/config/models/avaliador-confirmar-email.model';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import TipoItemEnum from 'src/enums/tipo-item.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(AvaliadorModel)
    private readonly avaliadorRepository: Repository<AvaliadorModel>,

    @InjectRepository(AvaliadorRecuperarSenhaModel)
    private readonly avaliadorRecuperarSenhaRepository: Repository<AvaliadorRecuperarSenhaModel>,

    @InjectRepository(AvaliadorConfirmarEmailModel)
    private readonly avaliadorConfirmacaoEmailRepository: Repository<AvaliadorConfirmarEmailModel>,

    private readonly jwtProvider: JwtProvider,
    private readonly emailTemplatesProvider: EmailTemplatesProvider,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const avaliadorRepo = manager.getRepository(AvaliadorModel);
      const emailExists = await avaliadorRepo.findOne({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email já cadastrado');
      }

      const salt = await bcrypt.genSalt(Env.HASH_SALT);
      const senha = await bcrypt.hash(dto.senha, salt);

      const novoAvaliador = avaliadorRepo.create({
        nome: dto.nome,
        email: dto.email,
        senha: senha,
      });

      await avaliadorRepo.save(novoAvaliador);

      const itemRepo = manager.getRepository(ItemSistemaArquivosModel);
      const bancoRepo = manager.getRepository(BancoDeConteudoModel);
      const bancosPadrao = [
        { tipo: TipoBancoEnum.QUESTOES, titulo: 'Banco de Questões' },
        { tipo: TipoBancoEnum.AVALIACOES, titulo: 'Banco de Avaliações' },
        { tipo: TipoBancoEnum.MATERIAIS, titulo: 'Banco de Materiais' },
      ];

      for (const bancoInfo of bancosPadrao) {
        const novaPasta = itemRepo.create({
          titulo: bancoInfo.titulo,
          tipo: TipoItemEnum.PASTA,
          avaliador: novoAvaliador,
          pai: null,
        });
        await itemRepo.save(novaPasta);

        const novoBanco = bancoRepo.create({
          tipoBanco: bancoInfo.tipo,
          avaliadorId: novoAvaliador.id,
          pastaRaiz: novaPasta,
        });
        await bancoRepo.save(novoBanco);
      }

      const confirmEmailRepo = manager.getRepository(
        AvaliadorConfirmarEmailModel,
      );

      const confirmacao = confirmEmailRepo.create({
        avaliadorId: novoAvaliador.id,
        hash: crypto.createHash('md5').update(uuid()).digest('hex'),
        isConfirmado: true,
        expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await confirmEmailRepo.save(confirmacao);

      console.log(
        `[AuthService] Usuário ${dto.email} criado e ativado automaticamente.`,
      );
    });
  }

  async confirmEmail(dto: ConfirmEmailDto): Promise<void> {
    const avaliadorConfirmacaoEmail =
      await this.avaliadorConfirmacaoEmailRepository.findOne({
        where: { hash: dto.hash },
      });

    if (!avaliadorConfirmacaoEmail || avaliadorConfirmacaoEmail.isConfirmado) {
      return;
    }
    if (avaliadorConfirmacaoEmail.expiraEm < new Date()) {
      throw new ForbiddenException('Hash expirado');
    }

    await this.avaliadorConfirmacaoEmailRepository.update(
      { id: avaliadorConfirmacaoEmail.id },
      { isConfirmado: true },
    );
  }

  async signIn(dto: SignInDto): Promise<SignInResultDto> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { email: dto.email },
    });

    if (!avaliador) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, avaliador.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const avaliadorConfirmacaoEmail =
      await this.avaliadorConfirmacaoEmailRepository.findOne({
        where: { avaliadorId: avaliador.id },
      });

    if (!avaliadorConfirmacaoEmail.isConfirmado) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const token = await this.jwtProvider.sign({ id: avaliador.id });

    return {
      token,
    };
  }

  async recoverPassword(dto: RecoverPasswordDto): Promise<void> {
    const avaliador = await this.avaliadorRepository.findOne({
      where: { email: dto.email },
    });

    if (!avaliador) {
      return;
    }

    const hash = crypto.createHash('md5').update(uuid()).digest('hex');

    const twentyFourHours = 1000 * 60 * 60 * 24;

    const avaliadorRecuperarSenha = new AvaliadorRecuperarSenhaModel();

    avaliadorRecuperarSenha.email = dto.email;
    avaliadorRecuperarSenha.hash = hash;
    avaliadorRecuperarSenha.expiraEm = new Date(Date.now() + twentyFourHours);

    await this.avaliadorRecuperarSenhaRepository.save(avaliadorRecuperarSenha);

    const url = `${Env.FRONTEND_URL}/auth/recuperar-senha/${avaliadorRecuperarSenha.hash}`;

    const html = this.emailTemplatesProvider.recoverPassword(url);

    await this.notificationProvider.sendEmail(
      dto.email,
      'Provus - Recuperação de Senha',
      html,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const avaliadorRecuperarSenha =
      await this.avaliadorRecuperarSenhaRepository.findOne({
        where: { hash: dto.hash },
      });

    if (!avaliadorRecuperarSenha) {
      throw new ForbiddenException('Não autorizado');
    }

    if (avaliadorRecuperarSenha.expiraEm < new Date()) {
      throw new ForbiddenException('Não autorizado');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const senha = await bcrypt.hash(dto.senha, salt);

    const avaliador = await this.avaliadorRepository.findOne({
      where: { email: avaliadorRecuperarSenha.email },
    });

    if (!avaliador) {
      throw new ForbiddenException('Não autorizado');
    }

    avaliador.senha = senha;

    await this.avaliadorRepository.save(avaliador);

    await this.avaliadorRecuperarSenhaRepository.delete(
      avaliadorRecuperarSenha.id,
    );
  }

  async validateToken(token: string): Promise<AvaliadorModel> {
    try {
      const decoded = await this.jwtProvider.verify(token);
      if (!decoded) {
        console.error(
          '[AuthService] Token inválido ou expirado na verificação JWT.',
        );
        return null;
      }

      const decodedToken = decoded as { id: number };

      const avaliador = await this.avaliadorRepository.findOne({
        where: { id: decodedToken.id },
      });

      if (!avaliador) {
        console.error(
          `[AuthService] Avaliador ID ${decodedToken.id} não encontrado no banco.`,
        );
        return null;
      }

      const avaliadorConfirmacaoEmail =
        await this.avaliadorConfirmacaoEmailRepository.findOne({
          where: { avaliadorId: avaliador.id },
        });

      if (!avaliadorConfirmacaoEmail) {
        console.error(
          `[AuthService] Registro de confirmação de e-mail não encontrado para ID ${avaliador.id}.`,
        );
        return null;
      }

      if (!avaliadorConfirmacaoEmail.isConfirmado) {
        console.error(
          `[AuthService] E-mail do avaliador ${avaliador.id} não está confirmado.`,
        );
        return null;
      }

      return avaliador;
    } catch (error) {
      console.error(
        '[AuthService] Erro crítico ao validar token:',
        error.message,
      );
      return null;
    }
  }
}
