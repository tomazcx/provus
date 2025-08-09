import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { SignInResponse } from './response';

export const SignInDecorators = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Login de um inspetor',
      description: 'Login de inspetor',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login de inspetor realizado com sucesso',
      type: SignInResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Email ou senha inválidos',
    }),
  );
};
