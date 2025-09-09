import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';
import { ArquivoService } from 'src/services/arquivo.service';
import { ApiTags } from '@nestjs/swagger';
import { FindArquivoDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class FindArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindArquivoDecorators()
  async find(
    @Param('id', ParseIntPipe) id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<ArquivoResponse> {
    return this.arquivoService.findById(id, avaliador);
  }
}
