import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SubmitAvaliacaoDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Envia as respostas de uma avaliação pelo aluno.',
      description:
        'Atualiza a submissao com as respostas fornecidas e marca como ENVIADA.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Respostas enviadas com sucesso.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'Submissão não encontrada ou não está em estado válido para envio.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos ou erro ao processar respostas.',
    }),
  );
};
