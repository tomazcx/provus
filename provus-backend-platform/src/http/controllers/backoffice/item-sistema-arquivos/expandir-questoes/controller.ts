import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ItemSistemaArquivosService } from 'src/services/item-sistema-arquivos.service';
import { ExpandirQuestoesRequest } from './request';
import { ExpandirQuestoesResponse } from './response';
import { ExpandirQuestoesDecorators } from './decorators';

@Controller('backoffice/pastas')
@ApiTags('Backoffice - Pastas')
export class ExpandirQuestoesController {
  constructor(private readonly itemService: ItemSistemaArquivosService) {}

  @Post('expandir-questoes')
  @UseGuards(AvaliadorAuthGuard)
  @ExpandirQuestoesDecorators()
  async handle(
    @Body() body: ExpandirQuestoesRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ExpandirQuestoesResponse> {
    const questionIds = await this.itemService.findAllQuestionIdsInFolders(
      body.folderIds,
      avaliador.id,
    );

    return { questionIds };
  }
}
