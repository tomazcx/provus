import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoRevisaoResponse } from './response';
import { FindSubmissaoRevisaoDecorators } from './decorators';
import { SubmissaoIpGuard } from 'src/http/guards/submissao-ip.guard';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class FindSubmissaoRevisaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get(':hash/revisao')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SubmissaoIpGuard)
  @FindSubmissaoRevisaoDecorators()
  async handleReview(
    @Param('hash') hash: string,
  ): Promise<FindSubmissaoRevisaoResponse> {
    const reviewData = await this.submissaoService.findSubmissaoForReview(hash);

    return reviewData;
  }
}
