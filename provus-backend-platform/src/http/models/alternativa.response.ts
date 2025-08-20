import { ApiProperty } from '@nestjs/swagger';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';

export class AlternativaResponse {
  @ApiProperty({
    description: 'ID da alternativa',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'O texto/descrição da alternativa',
    example: 'A resposta correta é a letra B.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Indica se esta é a alternativa correta',
    example: true,
  })
  isCorreto: boolean;

  static fromModel(model: AlternativaModel): AlternativaResponse {
    const response = new AlternativaResponse();
    response.id = model.id;
    response.descricao = model.descricao;
    response.isCorreto = model.isCorreto;
    return response;
  }
}
