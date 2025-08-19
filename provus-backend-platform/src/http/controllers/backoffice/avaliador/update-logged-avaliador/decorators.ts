import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvaliadorResponse } from 'src/http/models/avaliador.response';

export const UpdateAvaliadorDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza dados do avaliador logado',
      description: 'Atualiza dados do avaliador logado',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avaliador atualizado',
      type: AvaliadorResponse,
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
