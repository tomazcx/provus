import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoByHashResponse } from './response';
import { FindSubmissaoByHashDecorators } from './decorators';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class FindSubmissaoByHashController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get(':hash')
  @FindSubmissaoByHashDecorators()
  async handle(
    @Param('hash') hash: string,
  ): Promise<FindSubmissaoByHashResponse> {
    const submissao = await this.submissaoService.findSubmissaoByHash(hash);

    return FindSubmissaoByHashResponse.fromModel(submissao);
  }
}
