import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';

export const CreateAvaliacaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria uma nova avaliação',
      description: 'Cria uma nova avaliação',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliação criada com sucesso',
      type: AvaliacaoResponse,
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
