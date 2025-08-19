import { applyDecorators, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvaliadorResponse } from 'src/http/models/avaliador.response';

export const FindAvaliadorByIdDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Carrega dados do avaliador logado',
      description: 'Carrega dados do avaliador logado',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliador encontrado',
      type: AvaliadorResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
