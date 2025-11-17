import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoByHashResponse } from './response';
import { FindSubmissaoByHashDecorators } from './decorators';
import { SubmissaoIpGuard } from 'src/http/guards/submissao-ip.guard';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class FindSubmissaoByHashController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get(':hash')
  @UseGuards(SubmissaoIpGuard)
  @FindSubmissaoByHashDecorators()
  async handle(
    @Param('hash') hash: string,
  ): Promise<FindSubmissaoByHashResponse> {
    const submissao = await this.submissaoService.findSubmissaoByHash(hash);

    return FindSubmissaoByHashResponse.fromModel(submissao);
  }
}
