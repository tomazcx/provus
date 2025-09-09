import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestaoResponse } from 'src/http/models/response/questao.response';

export const UpdateQuestaoDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza uma questão existente',
      description:
        'Atualiza os dados de uma questão específica, incluindo seu título, dificuldade, e alternativas.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questão atualizada com sucesso.',
      type: QuestaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Dados inválidos. Verifique os campos enviados no corpo da requisição.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description:
        'Não autorizado. O token JWT é inválido ou não foi fornecido.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Questão não encontrada ou não pertence ao usuário logado.',
    }),
  );
};
