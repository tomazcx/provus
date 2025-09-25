import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { CreatePastaRequest } from './request';

@Controller('backoffice/pastas')
@ApiTags('Backoffice - Pastas')
export class CreatePastaController {
  constructor(
    private readonly itemSistemaArquivosService: ItemSistemaArquivosService,
  ) {}

  @Post()
  @UseGuards(AvaliadorAuthGuard)
  // Adicionar decorators do Swagger aqui se desejar
  async handle(
    @Body() body: CreatePastaRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ItemSistemaArquivosResponse> {
    const novoItem = await this.itemSistemaArquivosService.create(
      {
        ...body,
        tipo: TipoItemEnum.PASTA, // Define o tipo como PASTA
        avaliadorId: avaliador.id,
      },
      avaliador,
    );
    return ItemSistemaArquivosResponse.fromModel(novoItem);
  }
}
