import { TipoItemEnum } from "../../../enums/TipoItemEnum";
import { ArquivoApiResponse } from "./Arquivo.response";
import { ConfiguracaoAvaliacaoApiResponse } from "./ConfiguracaoAvaliacao.response";
import { QuestaoApiResponse } from "./Questao.response";

interface ArquivosAvaliacoesApiResponse {
  arquivo: ArquivoApiResponse;
  permitirConsultaPorEstudante: boolean;
}

export interface QuestoesDaAvaliacaoApiResponse extends QuestaoApiResponse {
  ordem: number;
  pontuacao: number;
}

export interface AvaliacaoApiResponse {
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  tipo: TipoItemEnum;
  paiId: number | null;
  path: string;
  criadoEm: string;
  atualizadoEm: string;
  arquivos: ArquivosAvaliacoesApiResponse[];
  questoes: QuestoesDaAvaliacaoApiResponse[];
  configuracaoAvaliacao: ConfiguracaoAvaliacaoApiResponse;
  pontuacao?: number;
}
