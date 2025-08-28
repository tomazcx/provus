import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosResponse } from 'src/http/models/item-sitema-arquivos.response';
import { BancoDeConteudoService } from 'src/services/banco-de-conteudo.service';

@Controller('backoffice/bancos-de-conteudo')
@ApiTags('Backoffice - Bancos de Conteúdo')
export class FindConteudoBancoController {
  constructor(private readonly bancoService: BancoDeConteudoService) {}

  @Get(':tipoBanco/conteudo')
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Param('tipoBanco') tipoBanco: TipoBancoEnum,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ItemSistemaArquivosResponse[]> {
    return this.bancoService.findConteudoByTipo(avaliador.id, tipoBanco);
  }
}
