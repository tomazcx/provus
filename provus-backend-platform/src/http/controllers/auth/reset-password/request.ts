import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequest {
  @ApiProperty({
    description: 'Hash da senha',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  hash: string;

  @ApiProperty({
    description: 'Senha',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  senha: string;
}
