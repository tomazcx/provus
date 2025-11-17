import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const UpdateSubmissaoEstadoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza o estado de uma submissão',
      description: 'Atualiza o estado de uma submissão',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Submissão atualizada com sucesso',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Submissão não encontrada',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
