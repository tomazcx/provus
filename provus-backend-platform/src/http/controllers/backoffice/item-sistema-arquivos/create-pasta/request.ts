import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePastaRequest {
  @ApiProperty({
    description: 'Título da nova pasta.',
    example: 'Minhas Provas de 2025',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description:
      'ID da pasta pai onde esta nova pasta será criada. Nulo para criar na raiz.',
    example: 34,
    required: false,
  })
  @IsInt()
  @IsOptional()
  paiId?: number;
}
