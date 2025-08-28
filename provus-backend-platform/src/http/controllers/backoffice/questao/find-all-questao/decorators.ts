import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestaoResponse } from 'src/http/models/questao.response';

export const FindAllQuestaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca todas as questões',
      description: 'Busca todas as questões',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questões encontradas com sucesso',
      type: QuestaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos',
    }),
  );
};
