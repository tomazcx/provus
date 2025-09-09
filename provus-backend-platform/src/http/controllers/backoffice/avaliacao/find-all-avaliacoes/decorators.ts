import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FindAllAvaliacoesResponse } from './response';

export const FindAllAvaliacoesDecorators = () => {
  return applyDecorators(
    ApiQuery({ name: 'pastaId', type: Number, required: true }),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra todas as avaliações',
      description: 'Encontra todas as avaliações',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliações encontradas',
      type: [FindAllAvaliacoesResponse],
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
