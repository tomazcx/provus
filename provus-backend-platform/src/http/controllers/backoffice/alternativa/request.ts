import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAlternativaRequest {
  @ApiProperty({
    description: 'O texto/título da alternativa.',
    example: 'É a cor azul.',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição opcional ou justificativa para a alternativa.',
    example: 'O céu é azul, por isso é a cor favorita.',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Indica se esta é a alternativa correta.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isCorreto: boolean;
}
