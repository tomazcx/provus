import { ApiProperty } from '@nestjs/swagger';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import { ArquivoModel } from 'src/database/config/models/arquivo.model';
import { SubmissaoRespostasModel } from 'src/database/config/models/submissao-respostas.model';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
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

  static fromModel(model: any): DadosRespostaSwaggerDto {
    return {
      texto: model.texto,
      alternativa_id: model.alternativa_id,
      alternativas_id: model.alternativas_id,
    };
  }
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

  static fromModel(model: AlternativaModel): AlternativaResponse {
    return {
      id: model.id,
      descricao: model.descricao,
    };
  }
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

  static fromModel(model: ArquivoModel): ArquivoSubmissaoResponse {
    return {
      id: model.id,
      titulo: model.item.titulo,
      url: model.url,
      descricao: model.descricao,
    };
  }
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

  static fromModel(model: SubmissaoRespostasModel): QuestaoSubmissaoResponse {
    return {
      id: model.questao.id,
      titulo: model.questao.item.titulo,
      descricao: model.questao.descricao,
      pontuacao: model.questao.pontuacao,
      dificuldade: model.questao.dificuldade,
      tipo: model.questao.tipoQuestao,
      alternativas: model.questao.alternativas.map((alternativa) =>
        AlternativaResponse.fromModel(alternativa),
      ),
      dadosResposta: model.dadosResposta,
      pontuacaoObtida: model.pontuacao,
      estadoCorrecao: model.estadoCorrecao,
      textoRevisao: model.textoRevisao,
    };
  }
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

  static fromModel(model: SubmissaoModel): SubmissaoResponse {
    return {
      id: model.id,
      aplicacao_id: model.aplicacao?.id ?? null,
      codigoEntrega: model.codigoEntrega,
      hash: model.hash,
      estado: model.estado,
      pontuacaoTotal: model.pontuacaoTotal,
      criadoEm: model.criadoEm.toISOString(),
      atualizadoEm: model.atualizadoEm.toISOString(),
      finalizadoEm: model.finalizadoEm
        ? model.finalizadoEm.toISOString()
        : null,
    };
  }
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
    description: 'Pontuação máxima possível da avaliação.',
    example: 100,
  })
  pontuacaoMaxima: number;

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

  @ApiProperty({ nullable: true })
  quantidadeTentativas: number | null;

  @ApiProperty({ nullable: true })
  proibirTrocarAbas: boolean | null;

  @ApiProperty({ nullable: true })
  proibirCopiarColar: boolean | null;

  @ApiProperty({
    description: 'Total de pontos perdidos por infrações até o momento.',
    example: 10,
  })
  pontosPerdidos: number;

  static fromModel(model: SubmissaoModel): FindSubmissaoByHashResponse {
    const configGerais =
      model.aplicacao.configuracao?.configuracoesGerais ??
      model.aplicacao.avaliacao.configuracaoAvaliacao?.configuracoesGerais;

    const configSeguranca =
      model.aplicacao.configuracao?.configuracoesSeguranca ??
      model.aplicacao.avaliacao.configuracaoAvaliacao?.configuracoesSeguranca;

    const totalPontosPerdidos = (
      model.registrosPunicaoPorOcorrencia || []
    ).reduce((acc, registro) => acc + (registro.pontuacaoPerdida || 0), 0);

    const pontuacaoMaxima =
      model.aplicacao.avaliacao.questoes?.reduce(
        (acc, q) => acc + Number(q.pontuacao || 0),
        0,
      ) ?? 0;

    return {
      submissao: SubmissaoResponse.fromModel(model),
      questoes: model.respostas
        .sort((a, b) => a.ordem - b.ordem)
        .map((resposta) => QuestaoSubmissaoResponse.fromModel(resposta)),
      arquivos: model.aplicacao.avaliacao.arquivos
        .filter((arquivo) => arquivo.permitirConsultaPorEstudante)
        .map((arquivo) => ArquivoSubmissaoResponse.fromModel(arquivo.arquivo)),
      dataInicioAplicacao: model.aplicacao.dataInicio?.toISOString() ?? null,
      tempoMaximoAvaliacao: configGerais?.tempoMaximo ?? null,
      descricaoAvaliacao: model.aplicacao.avaliacao.descricao ?? null,
      mostrarPontuacao: configGerais?.mostrarPontuacao ?? null,
      permitirRevisao: configGerais?.permitirRevisao ?? null,
      tituloAvaliacao: model.aplicacao.avaliacao.item.titulo ?? null,
      nomeAvaliador: model.aplicacao.avaliacao.item.avaliador.nome ?? null,
      quantidadeTentativas: configSeguranca?.quantidadeTentativas ?? null,
      proibirTrocarAbas: configSeguranca?.proibirTrocarAbas ?? null,
      proibirCopiarColar: configSeguranca?.proibirCopiarColar ?? null,
      pontosPerdidos: totalPontosPerdidos,
      pontuacaoMaxima: pontuacaoMaxima,
    };
  }
}
