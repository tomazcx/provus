import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AvaliacaoService } from 'src/services/avaliacao.service';
import { FindAvaliacaoByIdDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/avaliacao')
@ApiTags('Backoffice - Avaliação')
export class FindAvaliacaoByIdController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindAvaliacaoByIdDecorators()
  async handle(
    @Param('id') id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliacaoResponse> {
    return this.avaliacaoService.findById(id, avaliador);
  }
}
