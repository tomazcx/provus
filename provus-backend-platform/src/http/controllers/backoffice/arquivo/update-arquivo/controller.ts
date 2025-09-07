import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ArquivoService } from 'src/services/arquivo.service';
import { UpdateArquivoDecorators } from './decorators';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';
import { UpdateArquivoRequest } from './request';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class UpdateArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Patch(':id')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateArquivoDecorators()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArquivoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ArquivoResponse> {
    return this.arquivoService.update(id, avaliador.id, body);
  }
}
