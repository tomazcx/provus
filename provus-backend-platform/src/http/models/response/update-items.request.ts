import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateItemRequest {
  @ApiProperty({
    description: 'O novo título para o item.',
    example: 'Minha Pasta de Provas de 2025',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;
}
