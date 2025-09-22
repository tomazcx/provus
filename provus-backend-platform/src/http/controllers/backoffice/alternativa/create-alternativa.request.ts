import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAlternativaRequest {
  @ApiProperty({
    description: 'Descrição opcional ou justificativa para a alternativa.',
    example: 'O céu é azul, por isso é a cor favorita.',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Indica se esta é a alternativa correta.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isCorreto: boolean;
}
