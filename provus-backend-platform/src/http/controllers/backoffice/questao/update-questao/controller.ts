import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { QuestaoService } from 'src/services/questao.service';
import { UpdateQuestaoRequest } from './request';
import { UpdateQuestaoDecorators } from './decorators';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/questao')
@ApiTags('Backoffice - Questão')
export class UpdateQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Patch(':id')
  @UseGuards(AvaliadorAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UpdateQuestaoDecorators()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateQuestaoRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto> {
    return this.questaoService.update(id, avaliador.id, body);
  }
}
