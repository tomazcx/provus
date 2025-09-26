import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { BancoDeConteudoService } from 'src/services/banco-de-conteudo.service';
import { FindConteudoBancoDecorators } from './decorators';
import { QuestaoResponse } from 'src/http/models/response/questao.response';

type ConteudoBancoResponse = ItemSistemaArquivosResponse | QuestaoResponse;

@Controller('backoffice/bancos-de-conteudo')
@ApiTags('Backoffice - Bancos de Conteúdo')
export class FindConteudoBancoController {
  constructor(private readonly bancoService: BancoDeConteudoService) {}

  @Get(':tipoBanco/conteudo')
  @UseGuards(AvaliadorAuthGuard)
  @FindConteudoBancoDecorators()
  async handle(
    @Param('tipoBanco') tipoBanco: TipoBancoEnum,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ConteudoBancoResponse[]> {
    return this.bancoService.findConteudoByTipo(avaliador.id, tipoBanco);
  }
}
