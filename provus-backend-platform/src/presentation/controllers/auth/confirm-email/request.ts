import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailRequest {
  @ApiProperty({
    description: 'Hash de confirmação de email',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  hash: string;
}
