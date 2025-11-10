import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissaoService } from 'src/services/submissao.service';
import { UpdateSubmissaoEstadoRequest } from './request';
import { ParseIntPipe } from '@nestjs/common';
import { UpdateSubmissaoEstadoDecorators } from './decorators';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class UpdateAplicacaoSubmissaoEstadoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch(':aplicacaoId/submissao/:submissaoId/estado')
  @UpdateSubmissaoEstadoDecorators()
  async updateSubmissaoEstado(
    @Body() dto: UpdateSubmissaoEstadoRequest,
    @Param('aplicacaoId', ParseIntPipe) aplicacaoId: number,
    @Param('submissaoId', ParseIntPipe) submissaoId: number,
  ) {
    await this.submissaoService.updateSubmissaoEstado(
      submissaoId,
      aplicacaoId,
      dto.estado,
    );
  }
}
