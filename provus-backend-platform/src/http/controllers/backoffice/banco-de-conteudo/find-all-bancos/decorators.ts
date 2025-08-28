import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BancoDeConteudoResponse } from 'src/http/models/banco-de-conteudo.response';

export const FindAllBancosDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encontra todos os bancos de conteúdo',
      description: 'Encontra todos os bancos de conteúdo',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Bancos de conteúdo encontrados',
      type: [BancoDeConteudoResponse],
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
