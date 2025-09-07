import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AvaliacaoService } from 'src/services/avaliacao.service';
import { UpdateAvaliacaoDecorators } from './decorators';
import { CreateAvaliacaoRequest } from 'src/http/models/request/avaliacao.request';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';

@Controller('backoffice/avaliacao')
@ApiTags('Backoffice - Avaliação')
export class UpdateAvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Put(':id')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateAvaliacaoDecorators()
  async update(
    @Param('id') id: number,
    @Body() dto: CreateAvaliacaoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliacaoResponse> {
    return this.avaliacaoService.update(id, dto, avaliador);
  }
}
