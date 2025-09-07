import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ArquivoResponse } from 'src/http/models/response/arquivo.response';

export const FindAllArquivosDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra todos os arquivos',
      description: 'Encontra todos os arquivos',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Arquivos encontrados com sucesso',
      type: [ArquivoResponse],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos',
    }),
    ApiQuery({
      name: 'pastaId',
      type: Number,
      required: false,
    }),
  );
};
