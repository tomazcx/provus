import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { BancoDeConteudoResponse } from 'src/http/models/banco-de-conteudo.response';
import { BancoDeConteudoService } from 'src/services/banco-de-conteudo.service';

@Controller('backoffice/bancos-de-conteudo')
@ApiTags('Backoffice - Bancos de Conteúdo')
export class FindAllBancosController {
  constructor(private readonly bancoService: BancoDeConteudoService) {}

  @Get()
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<BancoDeConteudoResponse[]> {
    return this.bancoService.findAllForAvaliador(avaliador.id);
  }
}
