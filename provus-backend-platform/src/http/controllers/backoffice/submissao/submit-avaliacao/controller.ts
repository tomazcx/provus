import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoResultDto } from 'src/dto/result/submissao/submissao.result';
import { SubmitAvaliacaoRequest } from 'src/http/models/request/submit-avaliacao.request';
import { SubmissaoService } from 'src/services/submissao.service';
import { SubmitAvaliacaoDecorators } from './decorators';
import { SubmissaoIpGuard } from 'src/http/guards/submissao-ip.guard';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class SubmitAvaliacaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch(':hash/enviar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SubmissaoIpGuard)
  @SubmitAvaliacaoDecorators()
  async submit(
    @Param('hash') hash: string,
    @Body() body: SubmitAvaliacaoRequest,
  ): Promise<SubmissaoResultDto> {
    return await this.submissaoService.submitAnswers(hash, body.respostas);
  }
}
