import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSubmissaoDto } from 'src/dto/result/submissao/submissao.result';

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
      type: CreateSubmissaoDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Avaliação não encontrada ou código incorreto.',
    }),
  );
};
