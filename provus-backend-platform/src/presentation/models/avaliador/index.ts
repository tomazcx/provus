import { ApiProperty } from '@nestjs/swagger';
import { Avaliador } from 'src/domain/entities';

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

  static fromEntity(entity: Avaliador): AvaliadorResponse {
    return {
      id: entity.id,
      nome: entity.nome,
      email: entity.email,
      criadoEm: entity.criadoEm,
      atualizadoEm: entity.atualizadoEm,
    };
  }
}
