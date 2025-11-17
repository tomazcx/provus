import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindSubmissaoRevisaoResponse } from './response';

export const FindSubmissaoRevisaoDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Busca dados completos de uma submissão para revisão do aluno.',
      description:
        'Retorna a submissão, questões, respostas do aluno, gabarito e resultados da correção.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Dados da revisão da submissão.',
      type: FindSubmissaoRevisaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Submissão não encontrada.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'Revisão não permitida para esta submissão (ainda não corrigida ou configuração desabilitada).',
    }),
  );
};
