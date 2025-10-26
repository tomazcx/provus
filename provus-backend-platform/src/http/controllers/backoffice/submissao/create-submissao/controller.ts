import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubmissaoDecorators } from './decorators';
import { CreateSubmissaoRequest } from './request';
import { SubmissaoService } from 'src/services/submissao.service';
import { SubmissaoResponse } from 'src/http/models/response/submissao.response';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { Request } from 'express';
import { extractIPv4 } from 'src/shared/extract-ip';

@Controller('backoffice/encontrar-avaliacao')
@ApiTags('Backoffice - Submissao')
export class CreateSubmissaoController {
  private readonly logger = new Logger(CreateSubmissaoController.name);

  constructor(
    private readonly submissaoService: SubmissaoService,
    private readonly aplicacaoService: AplicacaoService,
  ) {}

  @Post()
  @CreateSubmissaoDecorators()
  async handle(
    @Body() body: CreateSubmissaoRequest,
    @Req() request: Request,
  ): Promise<SubmissaoResponse> {
    const aplicacao = await this.aplicacaoService.findByCode(body.codigoAcesso);

    if (
      aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca
        .ativarControleIp
    ) {
      const allowedIps =
        aplicacao.avaliacao.configuracaoAvaliacao.configuracoesSeguranca
          .ipsPermitidos;

      const clientIp = extractIPv4(request);

      this.logger.log(
        `Recebido requisição de criar submissão do IP: ${clientIp}`,
      );

      if (!allowedIps.some((ip) => ip.ip === clientIp)) {
        throw new UnauthorizedException('IP não permitido');
      }
    }

    return await this.submissaoService.createSubmissao(body);
  }
}
