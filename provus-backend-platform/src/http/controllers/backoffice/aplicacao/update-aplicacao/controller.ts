import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { UpdateAplicacaoDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';
import { UpdateAplicacaoDto } from 'src/dto/request/aplicacao/update-aplicacao.dto';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class UpdateAplicacaoController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Put(':id')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateAplicacaoDecorators()
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateAplicacaoDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AplicacaoResponse> {
    return this.aplicacaoService.update(id, dto.estado, avaliador);
  }
}
