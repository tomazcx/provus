import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ResetPasswordDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Redefinir senha',
      description: 'Redefinir senha do usuário',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Senha redefinida com sucesso',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Não autorizado',
    }),
  );
};
