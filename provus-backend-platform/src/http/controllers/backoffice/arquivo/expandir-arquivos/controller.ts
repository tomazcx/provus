import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { ExpandirArquivosRequest } from './request';

@Controller('backoffice/pastas')
@ApiTags('Backoffice - Pastas')
export class ExpandirArquivosController {
  constructor(private readonly itemService: ItemSistemaArquivosService) {}

  @Post('expandir-arquivos')
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Body() body: ExpandirArquivosRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<{ fileIds: number[] }> {
    const fileIds = await this.itemService.findAllFileIdsInFolders(
      body.folderIds,
      avaliador.id,
    );
    return { fileIds };
  }
}
