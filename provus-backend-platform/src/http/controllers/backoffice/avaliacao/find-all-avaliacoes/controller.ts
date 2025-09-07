import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AvaliacaoService } from 'src/services/avaliacao.service';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { FindAllAvaliacoesResponse } from './response';
import { FindAllAvaliacoesDecorators } from './decorators';

@Controller('backoffice/avaliacoes')
@ApiTags('Backoffice - Avaliação')
export class FindAllAvaliacoesController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Get()
  @UseGuards(AvaliadorAuthGuard)
  @FindAllAvaliacoesDecorators()
  async findAll(
    @Query('pastaId', ParseIntPipe) pastaId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<FindAllAvaliacoesResponse[]> {
    return await this.avaliacaoService.findAllByPasta(pastaId, avaliador.id);
  }
}
