import { ApiProperty } from '@nestjs/swagger';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

class AlternativaResponse {
  @ApiProperty({
    description: 'ID da alternativa',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Descrição da alternativa',
    example: 'Esta é uma alternativa correta',
  })
  descricao: string;
}

class ArquivoSubmissaoResponse {
  @ApiProperty({
    description: 'ID do arquivo',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título do arquivo',
    example: 'Documento de apoio',
  })
  titulo: string;

  @ApiProperty({
    description: 'URL do arquivo',
    example: 'https://example.com/arquivo.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Descrição do arquivo',
    example: 'Material de apoio para a questão',
  })
  descricao: string;
}

class QuestaoSubmissaoResponse {
  @ApiProperty({
    description: 'ID da questão',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título da questão',
    example: 'Questão sobre programação',
  })
  titulo: string;

  @ApiProperty({
    description: 'Descrição da questão',
    example: 'Qual é a diferença entre let e var em JavaScript?',
  })
  descricao: string;

  @ApiProperty({
    description: 'Pontuação da questão',
    example: 10,
  })
  pontuacao: number;

  @ApiProperty({
    description: 'Dificuldade da questão',
    enum: DificuldadeQuestaoEnum,
    example: DificuldadeQuestaoEnum.FACIL,
  })
  dificuldade: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'Tipo da questão',
    enum: TipoQuestaoEnum,
    example: TipoQuestaoEnum.MULTIPLA_ESCOLHA,
  })
  tipo: TipoQuestaoEnum;

  @ApiProperty({
    description: 'Alternativas da questão',
    type: [AlternativaResponse],
  })
  alternativas: AlternativaResponse[];

  @ApiProperty({
    description: 'Resposta do estudante',
    example: { alternativa_id: 1, texto: 'Resposta dissertativa' },
  })
  dadosResposta: any;
}

class SubmissaoResponse {
  @ApiProperty({
    description: 'ID da submissão',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID da aplicação',
    example: 1,
  })
  aplicacao_id: number;

  @ApiProperty({
    description: 'Código de entrega',
    example: 123456,
  })
  codigoEntrega: number;

  @ApiProperty({
    description: 'Hash único da submissão',
    example: 'abc123def456',
  })
  hash: string;

  @ApiProperty({
    description: 'Estado da submissão',
    enum: EstadoSubmissaoEnum,
    example: EstadoSubmissaoEnum.INICIADA,
  })
  estado: EstadoSubmissaoEnum;

  @ApiProperty({
    description: 'Pontuação total obtida',
    example: 85,
  })
  pontuacaoTotal: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-10-11T14:30:00.000Z',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2023-10-11T15:45:00.000Z',
  })
  atualizadoEm: string;

  @ApiProperty({
    description: 'Data de finalização',
    example: '2023-10-11T15:45:00.000Z',
    nullable: true,
  })
  finalizadoEm: string | null;
}

export class FindSubmissaoByHashResponse {
  @ApiProperty({
    description: 'Dados da submissão',
    type: SubmissaoResponse,
  })
  submissao: SubmissaoResponse;

  @ApiProperty({
    description: 'Lista de questões da submissão',
    type: [QuestaoSubmissaoResponse],
  })
  questoes: QuestaoSubmissaoResponse[];

  @ApiProperty({
    description: 'Lista de arquivos relacionados à submissão',
    type: [ArquivoSubmissaoResponse],
  })
  arquivos: ArquivoSubmissaoResponse[];
}
