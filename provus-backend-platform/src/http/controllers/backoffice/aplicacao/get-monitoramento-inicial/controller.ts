import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { MonitoramentoInicialResponseDto } from './response';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
@UseGuards(AvaliadorAuthGuard)
@ApiBearerAuth()
export class GetMonitoramentoInicialController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Get(':id/monitoramento-inicial')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca dados iniciais para monitoramento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados iniciais do monitoramento carregados.',
    type: MonitoramentoInicialResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aplicação não encontrada.',
  })
  async handle(
    @Param('id', ParseIntPipe) aplicacaoId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<MonitoramentoInicialResponseDto> {
    const data = await this.aplicacaoService.getMonitoramentoInicialData(
      aplicacaoId,
      avaliador.id,
    );
    if (!data) {
      throw new NotFoundException(
        'Dados de monitoramento não encontrados para esta aplicação.',
      );
    }
    return data;
  }
}
