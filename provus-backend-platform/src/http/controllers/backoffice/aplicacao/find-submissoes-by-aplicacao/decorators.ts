import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindSubmissoesResponseDto } from 'src/dto/result/submissao/find-submissoes.response.dto';

export const FindSubmissoesByAplicacaoDecorators = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Busca todas as submissões de uma aplicação' }),
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de submissões e detalhes da aplicação.',
      type: FindSubmissoesResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Aplicação não encontrada.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado.',
    }),
  );
};
