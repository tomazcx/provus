import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindConteudoPastaRequest {
  @ApiProperty({
    description: 'ID da pasta',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  pastaId: number;
}
