import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';

export class SubmitRespostaRequest {
  @ApiProperty({
    description: 'ID da questão respondida.',
    example: 101,
  })
  @IsInt()
  @IsNotEmpty()
  questaoId: number;

  @ApiProperty({
    description: 'Resposta textual para questões discursivas.',
    required: false,
    example: 'Minha resposta discursiva.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'O texto da resposta não pode ser vazio se fornecido.',
  })
  texto?: string;

  @ApiProperty({
    description: 'ID da alternativa selecionada para questões objetivas.',
    required: false,
    example: 3002,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID da alternativa deve ser um número.' })
  alternativa_id?: number | null;

  @ApiProperty({
    description:
      'Array de IDs das alternativas selecionadas para múltipla escolha ou V/F.',
    required: false,
    type: [Number],
    example: [3005, 3007],
  })
  @IsOptional()
  @IsArray()
  @IsNumber(
    {},
    { each: true, message: 'Cada ID de alternativa deve ser um número.' },
  )
  alternativas_id?: number[];
}
