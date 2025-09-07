import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { QuestaoResponse } from 'src/http/models/response/questao.response';
import { QuestaoService } from 'src/services/questao.service';
import { FindQuestaoDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/questao')
@ApiTags('Backoffice - Questão')
export class FindQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindQuestaoDecorators()
  async handle(
    @Param('id') id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<QuestaoResponse> {
    const novaQuestao = await this.questaoService.findById(id, avaliador);

    return QuestaoResponse.fromDto(novaQuestao);
  }
}
