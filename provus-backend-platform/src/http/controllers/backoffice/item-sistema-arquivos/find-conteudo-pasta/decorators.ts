import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';

export const FindConteudoPastaDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Encontra conteúdo de uma pasta' }),
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
