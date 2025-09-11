import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';

export const FindAplicacaoByIdDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra uma aplicação por ID',
      description: 'Encontra uma aplicação por ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Aplicação encontrada',
      type: AplicacaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Aplicação não encontrada',
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
