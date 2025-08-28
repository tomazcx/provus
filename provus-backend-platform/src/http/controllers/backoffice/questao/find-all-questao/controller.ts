import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { QuestaoResponse } from 'src/http/models/questao.response';
import { QuestaoService } from 'src/services/questao.service';
import { FindAllQuestaoDecorators } from './decorators';

@Controller('backoffice/questoes')
@ApiTags('Backoffice - Questões')
export class FindAllQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Get('pasta/:pastaId')
  @UseGuards(AvaliadorAuthGuard)
  @FindAllQuestaoDecorators()
  async handle(
    @Param('pastaId', ParseIntPipe) pastaId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<QuestaoResponse[]> {
    const paiId = pastaId === 0 ? null : pastaId;

    console.log(avaliador);
    const questoesDtos = await this.questaoService.findAllByPasta(
      paiId,
      avaliador.id,
    );

    return questoesDtos.map((dto) => QuestaoResponse.fromDto(dto));
  }
}
