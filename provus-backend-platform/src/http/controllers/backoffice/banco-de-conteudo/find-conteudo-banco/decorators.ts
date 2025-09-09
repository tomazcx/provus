import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';

export const FindConteudoBancoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra conteúdo de um banco de conteúdo',
      description: 'Encontra conteúdo de um banco de conteúdo',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Conteúdo encontrado',
      type: [ItemSistemaArquivosResponse],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
