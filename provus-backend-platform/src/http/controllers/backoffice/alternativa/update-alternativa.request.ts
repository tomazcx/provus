import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAlternativaDto {
  @ApiProperty({
    description: 'ID da alternativa existente a ser modificada.',
    example: 101,
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: 'O novo texto/título da alternativa.',
    example: 'Paris',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    description: 'O novo status de "correta" para a alternativa.',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCorreto?: boolean;
}
