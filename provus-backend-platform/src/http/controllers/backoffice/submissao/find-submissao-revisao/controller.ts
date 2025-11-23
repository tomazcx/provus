import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoRevisaoResponse } from './response';
import { FindSubmissaoRevisaoDecorators } from './decorators';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class FindSubmissaoRevisaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get(':hash/revisao')
  @HttpCode(HttpStatus.OK)
  @FindSubmissaoRevisaoDecorators()
  async handleReview(
    @Param('hash') hash: string,
  ): Promise<FindSubmissaoRevisaoResponse> {
    const reviewData = await this.submissaoService.findSubmissaoForReview(hash);

    return reviewData;
  }
}
