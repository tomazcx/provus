import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { EvaluateSubmissaoRespostaDiscursivaRequest } from './request';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class EvaluateSubmissaoRespostaDiscursivaController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch(':aplicacaoId/submissao/:submissaoId/questao/:questaoId')
  async evaluateSubmissaoRespostaDiscursiva(
    @Body() dto: EvaluateSubmissaoRespostaDiscursivaRequest,
    @Param('aplicacaoId', ParseIntPipe) aplicacaoId: number,
    @Param('submissaoId', ParseIntPipe) submissaoId: number,
    @Param('questaoId', ParseIntPipe) questaoId: number,
  ) {
    await this.submissaoService.evaluateDiscursiva(
      submissaoId,
      aplicacaoId,
      questaoId,
      dto,
    );
  }
}
