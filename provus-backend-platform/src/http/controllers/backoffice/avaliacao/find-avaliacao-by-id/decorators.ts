import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';

export const FindAvaliacaoByIdDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra uma avaliação por ID',
      description: 'Encontra uma avaliação por ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliação encontrada',
      type: AvaliacaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Avaliação não encontrada',
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
