import { ApiProperty } from '@nestjs/swagger';
import { ConfiguracaoAvaliacaoResponse } from './configuracao-avaliacao.response';
import { ArquivoResponse } from './arquivo.response';
import { QuestaoResponse } from './questao.response';

export class ArquivoAvaliacaoResponse {
  @ApiProperty({
    description: 'Arquivo da avaliação',
    type: ArquivoResponse,
  })
  arquivo: ArquivoResponse;

  @ApiProperty({
    description: 'Permitir consulta por estudante',
    example: true,
  })
  permitirConsultaPorEstudante: boolean;
}

export class AvaliacaoResponse {
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
    description: 'ID da pasta onde a avaliação será criada',
    example: 1,
  })
  paiId?: number;

  @ApiProperty({
    description: 'Arquivos da avaliação',
    type: [ArquivoAvaliacaoResponse],
  })
  arquivos: ArquivoAvaliacaoResponse[];

  @ApiProperty({
    description: 'Questões da avaliação',
    type: [QuestaoResponse],
  })
  questoes: QuestaoResponse[];

  @ApiProperty({
    description: 'Configurações da avaliação',
    type: ConfiguracaoAvaliacaoResponse,
  })
  configuracaoAvaliacao: ConfiguracaoAvaliacaoResponse;
}
