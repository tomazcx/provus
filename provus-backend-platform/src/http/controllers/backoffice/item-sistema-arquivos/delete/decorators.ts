import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteItemDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Deleta um item do sistema de arquivos',
      description:
        'Deleta um item (pasta, questão, avaliação, etc.) e todos os seus descendentes de forma recursiva.',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Item deletado com sucesso.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Item não encontrado ou não pertence ao usuário.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado.',
    }),
  );
};
