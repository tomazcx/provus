import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { DeleteItemDecorators } from './decorators';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/item-sistema-arquivos')
@ApiTags('Backoffice - Sistema de Arquivos')
export class DeleteItemController {
  constructor(
    private readonly itemSistemaArquivosService: ItemSistemaArquivosService,
  ) {}

  @Delete(':id')
  @UseGuards(AvaliadorAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteItemDecorators()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<void> {
    await this.itemSistemaArquivosService.delete(id, avaliador.id);
  }
}
