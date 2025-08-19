import { ApiProperty } from '@nestjs/swagger';

export class SignInResponse {
  @ApiProperty({
    description: 'Token de autenticação',
    example: '123456',
  })
  token: string;
}
