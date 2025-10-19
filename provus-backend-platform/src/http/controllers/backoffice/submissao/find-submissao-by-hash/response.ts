import { ApiProperty } from '@nestjs/swagger';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

export class DadosRespostaSwaggerDto {
  @ApiProperty({
    description: 'Resposta textual (para questões discursivas).',
    required: false,
    type: String,
    example: 'A resposta é...',
  })
  texto?: string;

  @ApiProperty({
    description: 'ID da alternativa selecionada (para questões objetivas).',
    required: false,
    type: Number,
    nullable: true,
    example: 3002,
  })
  alternativa_id?: number | null;

  @ApiProperty({
    description:
      'Array de IDs das alternativas selecionadas (para múltipla escolha ou V/F).',
    required: false,
    type: [Number],
    example: [3005, 3007],
  })
  alternativas_id?: number[];
}

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

export class ArquivoSubmissaoResponse {
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
    description:
      'Resposta do estudante (formato varia com o tipo). Um dos campos opcionais estará presente.',
    required: false,
    nullable: true,
    type: DadosRespostaSwaggerDto,
  })
  dadosResposta: DadosRespostaSwaggerDto | null;
  @ApiProperty({
    description: 'Pontuação obtida pelo aluno nesta questão.',
    example: 8.5,
    nullable: true,
  })
  pontuacaoObtida: number | null;

  @ApiProperty({
    description: 'Estado da correção da questão.',
    enum: EstadoQuestaoCorrigida,
    example: EstadoQuestaoCorrigida.CORRETA,
    nullable: true,
  })
  estadoCorrecao: EstadoQuestaoCorrigida | null;

  @ApiProperty({
    description: 'Feedback do professor para esta questão (se aplicável).',
    example: 'Boa argumentação, mas faltou citar a fonte X.',
    nullable: true,
  })
  textoRevisao: string | null;
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

  @ApiProperty({
    description: 'Data e hora de início da aplicação (ISO 8601).',
    example: '2025-10-18T10:00:00.000Z',
    nullable: true,
  })
  dataInicioAplicacao: string | null;

  @ApiProperty({
    description: 'Tempo máximo da avaliação em minutos.',
    example: 90,
    nullable: true,
  })
  tempoMaximoAvaliacao: number | null;

  @ApiProperty({
    description: 'Descrição/Instruções da avaliação original.',
    example: 'Leia atentamente as questões...',
    nullable: true,
  })
  descricaoAvaliacao: string | null;

  @ApiProperty({
    description: 'Indica se a pontuação final deve ser mostrada ao aluno.',
    example: true,
    nullable: true,
  })
  mostrarPontuacao: boolean | null;

  @ApiProperty({
    description: 'Indica se o aluno pode revisar a prova após a correção.',
    example: false,
    nullable: true,
  })
  permitirRevisao: boolean | null;

  @ApiProperty({
    description: 'Título original da avaliação.',
    example: 'Avaliação de História do Brasil',
    nullable: true,
  })
  tituloAvaliacao: string | null;

  @ApiProperty({
    description: 'Nome do professor (avaliador) responsável pela avaliação.',
    example: 'Prof. João Silva',
    nullable: true,
  })
  nomeAvaliador: string | null;
}
