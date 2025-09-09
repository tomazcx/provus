import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';

export const FindArquivoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra um arquivo',
      description: 'Encontra um arquivo',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Arquivo encontrado com sucesso',
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
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Arquivo não encontrado',
    }),
  );
};
