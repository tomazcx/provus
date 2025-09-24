import { ApiProperty } from '@nestjs/swagger';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';

export class SubmissaoResponse {
  @ApiProperty({
    description: 'ID único da submissão.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID da aplicação à qual a submissão pertence.',
    example: 42,
  })
  aplicacao_id: number;

  @ApiProperty({
    description: 'Código de entrega da submissão.',
    example: 123456,
  })
  codigoEntrega: number;

  @ApiProperty({
    description: 'Hash único para identificação da submissão.',
    example: 'a1b2c3d4e5f6a1b2',
  })
  hash: string;

  @ApiProperty({
    description: 'O estado atual da submissão.',
    enum: EstadoSubmissaoEnum,
    example: EstadoSubmissaoEnum.INICIADA,
  })
  estado: EstadoSubmissaoEnum;

  @ApiProperty({
    description: 'A pontuação total obtida na submissão.',
    example: 0,
  })
  pontuacaoTotal: number;

  @ApiProperty({
    description: 'Data de criação no formato ISO 8601.',
    example: '2025-09-24T19:30:00.000Z',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data da última atualização no formato ISO 8601.',
    example: '2025-09-24T19:30:00.000Z',
  })
  atualizadoEm: string;

  @ApiProperty({
    description: 'Data de finalização no formato ISO 8601 (pode ser nula).',
    example: null,
    nullable: true,
  })
  finalizadoEm: string | null;
}
