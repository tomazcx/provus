import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecoverPasswordRequest {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@teste.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
