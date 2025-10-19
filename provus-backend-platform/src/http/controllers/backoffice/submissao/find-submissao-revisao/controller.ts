import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoRevisaoResponse } from './response';

@Controller('backoffice/submissao')
@ApiTags('Backoffice - Submissao')
export class FindSubmissaoRevisaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get(':hash/revisao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Busca dados completos de uma submissão para revisão do aluno.',
    description:
      'Retorna a submissão, questões, respostas do aluno, gabarito e resultados da correção.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados da revisão da submissão.',
    type: FindSubmissaoRevisaoResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Submissão não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Revisão não permitida para esta submissão (ainda não corrigida ou configuração desabilitada).',
  })
  async handleReview(
    @Param('hash') hash: string,
  ): Promise<FindSubmissaoRevisaoResponse> {
    const reviewData = await this.submissaoService.findSubmissaoForReview(hash);

    return reviewData;
  }
}
