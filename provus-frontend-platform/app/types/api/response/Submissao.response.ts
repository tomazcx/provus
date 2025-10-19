import type EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";

interface TextoResposta {
  texto: string;
}

interface AlternativaUnicaResposta {
  alternativa_id: number | null;
}

interface AlternativasMultiplasResposta {
  alternativas_id: number[];
}

export type DadosResposta =
  | TextoResposta
  | AlternativaUnicaResposta
  | AlternativasMultiplasResposta
  | null;

export interface SubmissaoResponse {
  id: number;
  aplicacao_id: number;
  codigoEntrega: number;
  hash: string;
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: string | null;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string | null;
}

export interface AlternativaSubmissaoResponse {
  id: number;
  descricao: string;
}

export interface QuestaoSubmissaoResponse {
  id: number;
  titulo: string;
  descricao?: string;
  pontuacao: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum;
  alternativas: AlternativaSubmissaoResponse[];
  dadosResposta: DadosResposta | null;
  pontuacaoObtida: number | null;
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  textoRevisao: string | null;
}

export interface ArquivoSubmissaoResponse {
  id: number;
  titulo: string;
  url: string;
  descricao?: string;
}

export interface FindSubmissaoByHashResponse {
  submissao: SubmissaoResponse;
  questoes: QuestaoSubmissaoResponse[];
  arquivos: ArquivoSubmissaoResponse[];

  dataInicioAplicacao: string | null;
  tempoMaximoAvaliacao: number | null;
  descricaoAvaliacao: string | null;
  mostrarPontuacao: boolean | null;
  permitirRevisao: boolean | null;
  tituloAvaliacao: string | null;
  nomeAvaliador: string | null;
}
