import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';

export const UpdateAplicacaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza uma aplicação',
      description: 'Atualiza uma aplicação',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Aplicação atualizada com sucesso',
      type: AplicacaoResponse,
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
