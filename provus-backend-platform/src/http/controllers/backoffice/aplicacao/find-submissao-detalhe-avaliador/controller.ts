import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliadorSubmissaoDetalheDto } from 'src/dto/result/submissao/avaliador-submissao-detalhe.dto';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { SubmissaoService } from 'src/services/submissao.service';

@Controller('backoffice/aplicacao/:appId/submissao/:subId')
@ApiTags('Backoffice - Aplicação/Submissão (Avaliador)')
@ApiBearerAuth()
@UseGuards(AvaliadorAuthGuard)
export class FindSubmissionDetailsForEvaluatorController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca detalhes de uma submissão para o avaliador' })
  @ApiParam({ name: 'appId', description: 'ID da Aplicação' })
  @ApiParam({ name: 'subId', description: 'ID da Submissão' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da submissão recuperados.',
    type: AvaliadorSubmissaoDetalheDto,
  })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso proibido.' })
  async handle(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('subId', ParseIntPipe) subId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliadorSubmissaoDetalheDto> {
    return this.submissaoService.findSubmissionDetailsForEvaluator(
      appId,
      subId,
      avaliador.id,
    );
  }
}
