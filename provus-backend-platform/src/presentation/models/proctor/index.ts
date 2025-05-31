import { ApiProperty } from "@nestjs/swagger";
import { Proctor } from "src/domain/entities";

export class ProctorResponse {
  @ApiProperty({    
    description: 'ID do inspetor',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do inspetor',
    example: 'João da Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do inspetor',
    example: 'teste@teste.com',
  })
  email: string;

  @ApiProperty({
    description: 'Data de criação do inspetor',
    example: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização do inspetor',
    example: '2021-01-01',
  })
  updatedAt: Date;

  static fromEntity(entity: Proctor): ProctorResponse {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
