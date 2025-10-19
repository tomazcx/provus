import type EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type {
  SubmissaoResponse,
  ArquivoSubmissaoResponse,
  DadosResposta,
} from "./Submissao.response";

export interface AlternativaRevisaoResponse {
  id: number;
  descricao: string;
  isCorreto: boolean;
}

export interface QuestaoRevisaoResponse {
  id: number;
  titulo: string;
  descricao: string | null;
  pontuacaoMaxima: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum;
  alternativas: AlternativaRevisaoResponse[];
  dadosResposta: DadosResposta | null;
  pontuacaoObtida: string | null;
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  textoRevisao: string | null;
  exemploRespostaIa: string | null;
}

export interface FindSubmissaoRevisaoResponse {
  submissao: SubmissaoResponse;
  questoes: QuestaoRevisaoResponse[];
  arquivos: ArquivoSubmissaoResponse[];
  dataInicioAplicacao: string | null;
  tempoMaximoAvaliacao: number | null;
  descricaoAvaliacao: string | null;
  mostrarPontuacao: boolean | null;
  permitirRevisao: boolean | null;
  tituloAvaliacao: string | null;
  nomeAvaliador: string | null;
  quantidadeTentativas: number | null;
}
