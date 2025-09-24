import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmissaoResponse } from 'src/http/models/response/submissao.response';

export const CreateSubmissaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cria submissão.',
      description: 'Cria uma submissão',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Submissão criada com sucesso.',
      type: SubmissaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Avaliação não encontrada ou código incorreto.',
    }),
  );
};
