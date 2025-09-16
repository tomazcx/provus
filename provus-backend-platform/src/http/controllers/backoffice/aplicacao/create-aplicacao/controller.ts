import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { CreateAplicacaoDecorators } from './decorators';
import { CreateAplicacaoRequest } from 'src/http/models/request/aplicacao.request';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class CreateAplicacaoController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Post()
  @UseGuards(AvaliadorAuthGuard)
  @CreateAplicacaoDecorators()
  async create(
    @Body() dto: CreateAplicacaoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AplicacaoResponse> {
    return this.aplicacaoService.createAplicacao(dto, avaliador);
  }
}
