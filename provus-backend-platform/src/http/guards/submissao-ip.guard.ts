import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SubmissaoService } from 'src/services/submissao.service';
import { extractIPv4 } from 'src/shared/extract-ip';

@Injectable()
export class SubmissaoIpGuard implements CanActivate {
  private readonly logger = new Logger(SubmissaoIpGuard.name);

  constructor(private readonly submissaoService: SubmissaoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = extractIPv4(request);

    this.logger.log(`Recebido requisição de submissão do IP: ${ip}`);

    const submissao = await this.submissaoService.findSubmissaoByHash(
      request.params.hash,
    );

    if (!submissao) {
      throw new UnauthorizedException('Submissão inválida');
    }

    if (
      !submissao.aplicacao.avaliacao.configuracaoAvaliacao
        .configuracoesSeguranca.ativarControleIp
    ) {
      return true;
    }

    const allowedIps =
      submissao.aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca
        .ipsPermitidos;

    return allowedIps.some((ipPermitido) => ipPermitido.ip === ip);
  }
}
