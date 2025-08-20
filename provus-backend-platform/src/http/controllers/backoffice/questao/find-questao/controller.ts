import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { QuestaoResponse } from 'src/http/models/questao.response';
import { QuestaoService } from 'src/services/questao.service';
import { FindQuestaoDecorators } from './decorators';

@Controller('backoffice/questao')
@ApiTags('Backoffice - Questão')
export class FindQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindQuestaoDecorators()
  async handle(@Param('id') id: number): Promise<QuestaoResponse> {
    const novaQuestao = await this.questaoService.findById(id);

    return QuestaoResponse.fromDto(novaQuestao);
  }
}
