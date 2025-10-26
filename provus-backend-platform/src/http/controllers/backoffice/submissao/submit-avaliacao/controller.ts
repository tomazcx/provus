import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmissaoResultDto } from 'src/dto/result/submissao/submissao.result';
import { SubmitAvaliacaoRequest } from 'src/http/models/request/submit-avaliacao.request';
import { SubmissaoService } from 'src/services/submissao.service';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class SubmitAvaliacaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch(':hash/enviar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envia as respostas de uma avaliação pelo aluno.',
    description:
      'Atualiza a submissao com as respostas fornecidas e marca como ENVIADA.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Respostas enviadas com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Submissão não encontrada ou não está em estado válido para envio.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou erro ao processar respostas.',
  })
  async submit(
    @Param('hash') hash: string,
    @Body() body: SubmitAvaliacaoRequest,
  ): Promise<SubmissaoResultDto> {
    return await this.submissaoService.submitAnswers(hash, body.respostas);
  }
}
