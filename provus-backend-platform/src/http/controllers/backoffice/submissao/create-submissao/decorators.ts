import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const CreateSubmissaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria submissão.',
      description: 'Cria uma submissão',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Submissão criada com sucesso.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Avaliação não encontrada ou código incorreto.',
    }),
  );
};
