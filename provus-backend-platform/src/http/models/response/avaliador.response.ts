import { ApiProperty } from '@nestjs/swagger';

export class AvaliadorResponse {
  @ApiProperty({
    description: 'ID do inspetor',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do inspetor',
    example: 'João da Silva',
  })
  nome: string;

  @ApiProperty({
    description: 'Email do inspetor',
    example: 'teste@teste.com',
  })
  email: string;

  @ApiProperty({
    description: 'Data de criação do inspetor',
    example: '2021-01-01',
  })
  criadoEm: Date;

  @ApiProperty({
    description: 'Data de atualização do inspetor',
    example: '2021-01-01',
  })
  atualizadoEm: Date;
}
