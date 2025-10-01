import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';
import { ArquivoService } from 'src/services/arquivo.service';
import { FindArquivosByIdsRequest } from './request';

@Controller('backoffice/arquivos')
@ApiTags('Backoffice - Arquivo')
export class FindArquivosByIdsController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Post('detalhes-por-ids')
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Body() body: FindArquivosByIdsRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ArquivoResponse[]> {
    const arquivoDtos = await this.arquivoService.findByIds(
      body.arquivoIds,
      avaliador.id,
    );

    return arquivoDtos.map((dto) => ArquivoResponse.fromDto(dto));
  }
}
