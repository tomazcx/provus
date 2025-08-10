import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

export const SignUpDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastro de um inspetor',
      description: 'Cadastro de inspetor',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Inspetor cadastrado com sucesso',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Email já cadastrado',
    }),
  );
};
