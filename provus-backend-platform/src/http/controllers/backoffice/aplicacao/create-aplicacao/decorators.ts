import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';

export const CreateAplicacaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria uma nova aplicação',
      description: 'Cria uma nova aplicação',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Aplicação criada com sucesso',
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
