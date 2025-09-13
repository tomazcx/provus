import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteAplicacaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Deleta uma aplicação',
      description:
        'Deleta uma aplicação específica. A aplicação deve pertencer ao avaliador autenticado.',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Aplicação deletada com sucesso.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Aplicação não encontrada ou não pertence ao usuário.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado.',
    }),
  );
};
