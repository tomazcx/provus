import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AvaliadorSubmissaoDetalheDto } from 'src/dto/result/submissao/avaliador-submissao-detalhe.dto';

export const FindSubmissionDetailsForEvaluatorDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Busca detalhes de uma submissão para o avaliador',
    }),
    ApiBearerAuth(),
    ApiParam({ name: 'appId', description: 'ID da Aplicação' }),
    ApiParam({ name: 'subId', description: 'ID da Submissão' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Detalhes da submissão recuperados.',
      type: AvaliadorSubmissaoDetalheDto,
    }),
    ApiResponse({ status: 404, description: 'Submissão não encontrada.' }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Acesso proibido.',
    }),
  );
};
