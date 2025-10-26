import { ApiProperty } from '@nestjs/swagger';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { SubmissaoResponse } from 'src/http/models/response/submissao.response';
import {
  ArquivoSubmissaoResponse,
  DadosRespostaSwaggerDto,
} from '../find-submissao-by-hash/response';

class AlternativaRevisaoResponse {
  @ApiProperty({ description: 'ID da alternativa' })
  id: number;
  @ApiProperty({ description: 'Descrição da alternativa' })
  descricao: string;
  @ApiProperty({ description: 'Indica se esta alternativa é a correta' })
  isCorreto: boolean;
}

class QuestaoRevisaoResponse {
  @ApiProperty({ description: 'ID da questão' })
  id: number;
  @ApiProperty({ description: 'Título da questão' })
  titulo: string;
  @ApiProperty({
    description: 'Descrição/enunciado da questão',
    nullable: true,
  })
  descricao: string | null;
  @ApiProperty({ description: 'Pontuação máxima da questão' })
  pontuacaoMaxima: number;
  @ApiProperty({
    enum: DificuldadeQuestaoEnum,
    description: 'Dificuldade da questão',
  })
  dificuldade: DificuldadeQuestaoEnum;
  @ApiProperty({ enum: TipoQuestaoEnum, description: 'Tipo da questão' })
  tipo: TipoQuestaoEnum;
  @ApiProperty({
    type: [AlternativaRevisaoResponse],
    description: 'Alternativas com gabarito',
  })
  alternativas: AlternativaRevisaoResponse[];
  @ApiProperty({
    type: DadosRespostaSwaggerDto,
    nullable: true,
    description: 'Resposta do aluno',
  })
  dadosResposta: DadosRespostaSwaggerDto | null;
  @ApiProperty({ nullable: true, description: 'Pontuação obtida pelo aluno' })
  pontuacaoObtida: number | null;
  @ApiProperty({
    enum: EstadoQuestaoCorrigida,
    nullable: true,
    description: 'Estado da correção',
  })
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  @ApiProperty({ nullable: true, description: 'Feedback do professor' })
  textoRevisao: string | null;
  @ApiProperty({
    nullable: true,
    description: 'Exemplo de resposta (para discursivas)',
  })
  exemploRespostaIa: string | null;
}

export class FindSubmissaoRevisaoResponse {
  @ApiProperty({ type: SubmissaoResponse })
  submissao: SubmissaoResponse;

  @ApiProperty({ type: [QuestaoRevisaoResponse] })
  questoes: QuestaoRevisaoResponse[];

  @ApiProperty({ type: [ArquivoSubmissaoResponse] })
  arquivos: ArquivoSubmissaoResponse[];

  @ApiProperty({ nullable: true })
  dataInicioAplicacao: string | null;

  @ApiProperty({ nullable: true })
  tempoMaximoAvaliacao: number | null;

  @ApiProperty({ nullable: true })
  descricaoAvaliacao: string | null;

  @ApiProperty({ nullable: true })
  mostrarPontuacao: boolean | null;

  @ApiProperty({ nullable: true })
  permitirRevisao: boolean | null;

  @ApiProperty({ nullable: true })
  tituloAvaliacao: string | null;

  @ApiProperty({ nullable: true })
  nomeAvaliador: string | null;

  @ApiProperty({
    description: 'Número de tentativas permitidas para esta avaliação.',
    example: 1,
    nullable: true,
  })
  quantidadeTentativas: number | null;
}
