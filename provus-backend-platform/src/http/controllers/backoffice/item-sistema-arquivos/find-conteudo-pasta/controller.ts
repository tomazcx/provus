import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { FindConteudoPastaDecorators } from './decorators';

@Controller('backoffice/pastas')
@ApiTags('Backoffice - Pastas')
export class FindConteudoPastaController {
  constructor(private readonly itemService: ItemSistemaArquivosService) {}

  @Get(':pastaId/conteudo')
  @UseGuards(AvaliadorAuthGuard)
  @FindConteudoPastaDecorators()
  async handle(
    @Param('pastaId', ParseIntPipe) pastaId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ItemSistemaArquivosResponse[]> {
    return this.itemService.findByFolder(pastaId, avaliador.id);
  }
}
