import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { FindAllAplicacoesResponse } from './response';
import { FindAllAplicacoesDecorators } from './decorators';

@Controller('backoffice/aplicacoes')
@ApiTags('Backoffice - Aplicação')
export class FindAllAplicacoesController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Get()
  @UseGuards(AvaliadorAuthGuard)
  @FindAllAplicacoesDecorators()
  async findAll(
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<FindAllAplicacoesResponse[]> {
    return await this.aplicacaoService.findAll(avaliador.id); // TODO: Alterar aqui também para nao receber pasta, mas sim retornar todas aplicações
  }
}
