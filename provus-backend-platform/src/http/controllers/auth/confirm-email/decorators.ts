import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ConfirmEmailDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirmar email',
      description: 'Confirmar email do usuário',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Email confirmado com sucesso',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Permissão negada',
    }),
  );
};
