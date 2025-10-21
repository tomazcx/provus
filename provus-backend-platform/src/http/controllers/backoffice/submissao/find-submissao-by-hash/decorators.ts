import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindSubmissaoByHashResponse } from './response';

export const FindSubmissaoByHashDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Encontra uma submissão por hash.',
      description: 'Encontra uma submissão por hash',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Submissão encontrada com sucesso.',
      type: FindSubmissaoByHashResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Submissão não encontrada.',
    }),
  );
};
