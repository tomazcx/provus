import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { UpdateReleaseConfigDto } from 'src/dto/request/aplicacao/update-release-config.dto';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { UpdateReleaseConfigDecorators } from './decorators';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class UpdateReleaseConfigController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Patch(':id/configuracoes-liberacao')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateReleaseConfigDecorators()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReleaseConfigDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AplicacaoResponse> {
    return this.aplicacaoService.updateReleaseConfig(id, dto, avaliador);
  }
}
