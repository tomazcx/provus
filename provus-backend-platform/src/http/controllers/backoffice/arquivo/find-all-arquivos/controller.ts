import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { ArquivoService } from 'src/services/arquivo.service';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';
import { FindAllArquivosDecorators } from './decorators';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class FindAllArquivosController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Get('')
  @UseGuards(AvaliadorAuthGuard)
  @FindAllArquivosDecorators()
  async findAll(
    @Query('pastaId', ParseIntPipe) pastaId: number | null,
    @LoggedAvaliador() user: AvaliadorModel,
  ): Promise<ArquivoResponse[]> {
    return this.arquivoService.findAllByPasta(pastaId, user.id);
  }
}
