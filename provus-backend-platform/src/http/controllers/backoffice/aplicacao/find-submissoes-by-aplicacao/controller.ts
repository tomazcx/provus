import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { FindSubmissoesResponseDto } from 'src/dto/result/submissao/find-submissoes.response.dto';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { SubmissaoService } from 'src/services/submissao.service';

@Controller('backoffice/aplicacao/:id/submissoes')
@ApiTags('Backoffice - Aplicação')
@ApiBearerAuth()
@UseGuards(AvaliadorAuthGuard)
export class FindSubmissoesByAplicacaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get()
  @ApiOperation({ summary: 'Busca todas as submissões de uma aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de submissões e detalhes da aplicação.',
    type: FindSubmissoesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Aplicação não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async handle(
    @Param('id', ParseIntPipe) aplicacaoId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<FindSubmissoesResponseDto> {
    return this.submissaoService.findSubmissionsByApplication(
      aplicacaoId,
      avaliador.id,
    );
  }
}
