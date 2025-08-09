import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const RecoverPasswordDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Recuperar senha',
      description: 'Recuperar senha do usuário',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Senha recuperada com sucesso',
    }),
  );
};
