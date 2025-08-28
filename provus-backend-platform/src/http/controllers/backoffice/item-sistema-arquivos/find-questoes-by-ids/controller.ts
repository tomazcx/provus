import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { QuestaoResponse } from 'src/http/models/questao.response';
import { QuestaoService } from 'src/services/questao.service';

class FindQuestoesByIdsDto {
  questionIds: number[];
}

@Controller('backoffice/questoes')
@ApiTags('Backoffice - Questões')
export class FindQuestoesByIdsController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Post('detalhes-por-ids')
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Body() body: FindQuestoesByIdsDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<QuestaoResponse[]> {
    const questoesDtos = await this.questaoService.findByIds(
      body.questionIds,
      avaliador.id,
    );
    return questoesDtos.map((dto) => QuestaoResponse.fromDto(dto));
  }
}
