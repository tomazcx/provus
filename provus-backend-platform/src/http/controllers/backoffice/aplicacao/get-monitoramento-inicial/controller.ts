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
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { MonitoramentoInicialResponseDto } from './response';
import { GetMonitoramentoInicialDecorators } from './decorators';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class GetMonitoramentoInicialController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Get(':id/monitoramento-inicial')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AvaliadorAuthGuard)
  @GetMonitoramentoInicialDecorators()
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
