import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestaoResponse } from 'src/http/models/response/questao.response';

export const GenerateDiscursiveByAiDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Gera uma questão usando IA apenas pelo assunto dado.',
      description: 'Gera uma questão usando IA apenas pelo assunto dado.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questão gerada com sucesso',
      type: QuestaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Dados inválidos',
    }),
  );
};
