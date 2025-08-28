import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FindQuestoesByIdsRequest } from './request';
import { QuestaoResponse } from 'src/http/models/questao.response';

export const FindQuestoesByIdsDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Encontra questões por IDs' }),
    ApiBody({ type: FindQuestoesByIdsRequest }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questões encontradas',
      type: [QuestaoResponse],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
