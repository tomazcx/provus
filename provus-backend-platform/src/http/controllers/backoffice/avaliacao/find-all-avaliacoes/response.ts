import { ApiProperty } from '@nestjs/swagger';

export class FindAllAvaliacoesResponse {
  @ApiProperty({
    description: 'ID da avaliação',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título da avaliação',
    example: 'Avaliação de Matemática',
  })
  titulo: string;

  @ApiProperty({
    description: 'Descrição da avaliação',
    example: 'Avaliação de Matemática',
  })
  descricao: string;

  @ApiProperty({
    description: 'Se a avaliação é um modelo',
    example: true,
  })
  isModelo: boolean;

  @ApiProperty({
    description: 'Data de criação da avaliação',
    example: '2021-01-01',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data de atualização da avaliação',
    example: '2021-01-01',
  })
  atualizadoEm: string;
}
