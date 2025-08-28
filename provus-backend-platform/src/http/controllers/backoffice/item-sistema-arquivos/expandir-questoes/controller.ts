import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';

class ExpandirQuestoesDto {
  folderIds: number[];
}

@Controller('backoffice/pastas')
@ApiTags('Backoffice - Pastas')
export class ExpandirQuestoesController {
  constructor(private readonly itemService: ItemSistemaArquivosService) {}

  @Post('expandir-questoes')
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Body() body: ExpandirQuestoesDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<number[]> {
    return this.itemService.findAllQuestionIdsInFolders(
      body.folderIds,
      avaliador.id,
    );
  }
}
