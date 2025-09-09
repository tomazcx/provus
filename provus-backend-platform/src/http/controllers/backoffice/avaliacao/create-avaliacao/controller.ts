import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { CreateAvaliacaoRequest } from 'src/http/models/request/avaliacao.request';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';
import { AvaliacaoService } from 'src/services/avaliacao.service';
import { CreateAvaliacaoDecorators } from './decorators';

@Controller('backoffice/avaliacao')
@ApiTags('Backoffice - Avaliação')
export class CreateAvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  @UseGuards(AvaliadorAuthGuard)
  @CreateAvaliacaoDecorators()
  async create(
    @Body() dto: CreateAvaliacaoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliacaoResponse> {
    return this.avaliacaoService.create(dto, avaliador);
  }
}
