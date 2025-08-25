import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { CreateQuestaoDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { CreateQuestaoRequest } from './request';
import { QuestaoService } from 'src/services/questao.service';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/questao')
@ApiTags('Backoffice - Questão')
export class CreateQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Post('nova')
  @UseGuards(AvaliadorAuthGuard)
  @CreateQuestaoDecorators()
  handle(
    @Body() body: CreateQuestaoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ) {
    return this.questaoService.create(body, avaliador);
  }
}
