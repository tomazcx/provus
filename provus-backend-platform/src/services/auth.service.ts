import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Logger,
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
  private readonly logger = new Logger(AuthService.name);

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
    // 1. Executa a transação e retorna os dados necessários para o email
    const dadosEmail = await this.dataSource.transaction(async (manager) => {
      try {
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
          isConfirmado: false,
          expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await confirmEmailRepo.save(confirmacao);

        return {
          email: dto.email,
          hash: confirmacao.hash,
        };
      } catch (error) {
        this.logger.error('ERRO CRÍTICO DENTRO DA TRANSAÇÃO DO SIGNUP:', error);
        throw error;
      }
    });

    if (dadosEmail) {
      const url = `${Env.FRONTEND_URL}/confirmar-email/${dadosEmail.hash}`;
      const html = this.emailTemplatesProvider.confirmEmail(url);

      this.notificationProvider
        .sendEmail(dadosEmail.email, 'Provus - Confirmação de Email', html)
        .then(() => {
          this.logger.log(
            `Email de boas-vindas enviado para ${dadosEmail.email} em background.`,
          );
        })
        .catch((err) => {
          this.logger.error(
            `Falha no envio de email em background para ${dadosEmail.email}: ${err.message}`,
          );
        });
    }
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
      throw new ForbiddenException('Link de confirmação expirado');
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

    this.notificationProvider
      .sendEmail(dto.email, 'Provus - Recuperação de Senha', html)
      .catch((err) =>
        this.logger.error(
          `Erro ao enviar email de recuperação: ${err.message}`,
        ),
      );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const avaliadorRecuperarSenha =
      await this.avaliadorRecuperarSenhaRepository.findOne({
        where: { hash: dto.hash },
      });

    if (!avaliadorRecuperarSenha) {
      throw new ForbiddenException('Token inválido ou não encontrado');
    }

    if (avaliadorRecuperarSenha.expiraEm < new Date()) {
      throw new ForbiddenException('Token expirado');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const senha = await bcrypt.hash(dto.senha, salt);

    const avaliador = await this.avaliadorRepository.findOne({
      where: { email: avaliadorRecuperarSenha.email },
    });

    if (!avaliador) {
      throw new ForbiddenException('Usuário não encontrado');
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
        return null;
      }

      const decodedToken = decoded as { id: number };

      const avaliador = await this.avaliadorRepository.findOne({
        where: { id: decodedToken.id },
      });

      if (!avaliador) {
        return null;
      }

      return avaliador;
    } catch (error) {
      return null;
    }
  }
}
