import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvaliacaoResponse } from 'src/http/models/response/avaliacao.response';

export const UpdateAvaliacaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza uma avaliação',
      description: 'Atualiza uma avaliação',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliação atualizada com sucesso',
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
