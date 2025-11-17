import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const EvaluateSubmissaoRespostaDiscursivaDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Avalia uma resposta discursiva',
      description: 'Avalia uma resposta discursiva',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Resposta discursiva avaliada com sucesso',
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
