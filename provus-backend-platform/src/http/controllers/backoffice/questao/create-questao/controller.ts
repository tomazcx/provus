import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
// import { CreateQuestaoDecorators } from './decorators';
// import { Avaliador } from 'src/domain/entities/avaliador.entity';
// import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
// import { CreateQuestaoRequest } from './request';
// import { QuestaoResponse } from 'src/http/models/questao.response';
import { QuestaoService } from 'src/services/questao.service';

@Controller('backoffice/questao')
@ApiTags('Backoffice - Questão')
export class CreateQuestaoController {
  constructor(private readonly questaoService: QuestaoService) {}

  //   @Post('nova')
  //   @UseGuards(AvaliadorAuthGuard)
  //   @CreateQuestaoDecorators()
  //   async handle(
  //     @Body() body: CreateQuestaoRequest,
  //     @LoggedAvaliador() avaliador: Avaliador,
  //   ): Promise<QuestaoResponse> {
  //     // 2. Chamar o método `create` do serviço, passando os dados do DTO e o avaliador logado.
  //     const novaQuestao = await this.questaoService.create(body, avaliador);

  //     // 3. Converter a entidade de domínio retornada pelo serviço para o formato de resposta da API.
  //     return QuestaoResponse.fromEntity(novaQuestao);
  //   }
}
