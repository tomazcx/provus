import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';

export const UpdateArquivoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza um arquivo',
      description: 'Atualiza um arquivo',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Arquivo atualizado com sucesso',
      type: ArquivoResponse,
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
