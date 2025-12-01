import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AplicacaoResponse } from 'src/http/models/response/aplicacao.response';

export const UpdateReleaseConfigDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Atualiza configurações de liberação (Nota/Revisão)',
      description:
        'Permite liberar ou ocultar notas e revisões após a criação da aplicação.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Configurações atualizadas.',
      type: AplicacaoResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Aplicação não encontrada.',
    }),
  );
};
