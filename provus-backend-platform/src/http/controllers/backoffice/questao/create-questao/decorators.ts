import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestaoResponse } from 'src/http/models/questao.response';

export const CreateQuestaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria uma nova questão',
      description: 'Cria uma nova questão',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questão criada com sucesso',
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
