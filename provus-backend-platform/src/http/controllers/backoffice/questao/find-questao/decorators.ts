import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestaoResponse } from 'src/http/models/response/questao.response';

export const FindQuestaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Busca uma questão por ID',
      description: 'Busca uma questão por ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questão encontrada com sucesso',
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
