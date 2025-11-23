import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoResultDto } from 'src/dto/result/submissao/submissao.result';
import { SubmitAvaliacaoRequest } from 'src/http/models/request/submit-avaliacao.request';
import { SubmissaoService } from 'src/services/submissao.service';
import { SubmitAvaliacaoDecorators } from './decorators';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class SubmitAvaliacaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch(':hash/enviar')
  @HttpCode(HttpStatus.OK)
  @SubmitAvaliacaoDecorators()
  async submit(
    @Param('hash') hash: string,
    @Body() body: SubmitAvaliacaoRequest,
  ): Promise<SubmissaoResultDto> {
    return await this.submissaoService.submitAnswers(hash, body.respostas);
  }
}
