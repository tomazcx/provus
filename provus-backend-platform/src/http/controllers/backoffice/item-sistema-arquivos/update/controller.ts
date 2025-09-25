import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { UpdateItemRequest } from 'src/http/models/response/update-items.request';
import { UpdateItemDecorators } from './decorators';

@Controller('backoffice/item-sistema-arquivos')
@ApiTags('Backoffice - Sistema de Arquivos')
export class UpdateItemSistemaArquivosController {
  constructor(
    private readonly itemSistemaArquivosService: ItemSistemaArquivosService,
  ) {}

  @Patch(':id')
  @UseGuards(AvaliadorAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UpdateItemDecorators()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateItemRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ItemSistemaArquivosResponse> {
    const updatedItem = await this.itemSistemaArquivosService.updateTitle(
      id,
      avaliador.id,
      body,
    );

    return ItemSistemaArquivosResponse.fromModel(updatedItem);
  }
}
