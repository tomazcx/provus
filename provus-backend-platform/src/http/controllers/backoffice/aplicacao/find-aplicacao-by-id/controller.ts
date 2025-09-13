import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { FindAplicacaoByIdDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class FindAplicacaoByIdController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindAplicacaoByIdDecorators()
  async handle(
    @Param('id') id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AplicacaoResponse> {
    return this.aplicacaoService.findById(id, avaliador);
  }
}
