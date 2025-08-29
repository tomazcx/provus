import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArquivoResponse } from 'src/http/models/arquivo.response';

export const CreateArquivoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria um novo arquivo',
      description: 'Cria um novo arquivo',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Arquivo criado com sucesso',
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
