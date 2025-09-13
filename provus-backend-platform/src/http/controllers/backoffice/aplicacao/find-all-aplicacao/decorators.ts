import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindAllAplicacoesResponse } from './response';

export const FindAllAplicacoesDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra todas as aplicações',
      description: 'Encontra todas as aplicações',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Aplicações encontradas',
      type: [FindAllAplicacoesResponse],
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
