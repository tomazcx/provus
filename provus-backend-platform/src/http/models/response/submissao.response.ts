import { ApiProperty } from '@nestjs/swagger';
import { CreateSubmissaoDto } from 'src/dto/result/submissao/submissao.result';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';

export class SubmissaoResponse {
  @ApiProperty({
    description: 'ID da submissão',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Submissão',
    example: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'ID único da submissão.',
          example: 1,
        },
        aplicacao_id: {
          type: 'integer',
          description: 'ID da aplicação à qual a submissão pertence.',
          example: 42,
        },
        codigoEntrega: {
          type: 'integer',
          description: 'Código de entrega opcional da submissão.',
          nullable: true,
          example: 98765,
        },
        hash: {
          type: 'string',
          description: 'Hash único para identificação e acesso à submissão.',
          example: 'b8a3e7e0f6c4d2a1c9e8d7b6a5f4e3d2',
        },
        estado: {
          type: 'string',
          description: 'O estado atual da submissão.',
          enum: ['PENDENTE', 'EM_AVALIACAO', 'FINALIZADA', 'CANCELADA'],
          example: 'FINALIZADA',
        },
        pontuacaoTotal: {
          type: 'number',
          format: 'float',
          description: 'A pontuação total obtida na submissão.',
          example: 92.5,
        },
        criadoEm: {
          type: 'string',
          format: 'date-time',
          description:
            'Data e hora de criação da submissão no formato ISO 8601.',
          example: '2025-09-16T18:30:00Z',
        },
        atualizadoEm: {
          type: 'string',
          format: 'date-time',
          description:
            'Data e hora da última atualização da submissão no formato ISO 8601.',
          example: '2025-09-16T18:45:10Z',
        },
        finalizadoEm: {
          type: 'string',
          format: 'date-time',
          description:
            'Data e hora em que a submissão foi finalizada no formato ISO 8601.',
          example: '2025-09-16T18:45:00Z',
        },
      },
      required: [
        'id',
        'aplicacao_id',
        'hash',
        'estado',
        'pontuacaoTotal',
        'criadoEm',
        'atualizadoEm',
        'finalizadoEm',
      ],
    },
  })
  CreateSubmissao: CreateSubmissaoDto;

  @ApiProperty({
    description: 'ID da aplicação',
    example: 1223,
  })
  idAplicacao: number;

  @ApiProperty({
    description: 'Código da entrega',
    example: 1234,
  })
  codigoEntrega: number;

  @ApiProperty({
    description: 'Hash da submissão',
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  })
  hashSubmissao: string;

  @ApiProperty({
    description: 'Estado da submissão',
    example: EstadoSubmissaoEnum.ENVIADA,
  })
  estado: EstadoSubmissaoEnum;

  @ApiProperty({
    description: 'Pontuação total',
    example: 98.1,
  })
  pontuacaoTotal: number;

  @ApiProperty({
    description: 'Data de criação da submissão',
    example: new Date().toISOString(),
  })
  dataCriacao: string;

  @ApiProperty({
    description: 'Data de atualização da submissão',
    example: new Date().toISOString(),
  })
  dataAtualizacao: string;

  @ApiProperty({
    description: 'Data de finalização da submissão',
    example: new Date().toISOString(),
  })
  dataFim: string;
}
