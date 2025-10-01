import type { CreateConfiguracaoAvaliacaoRequest } from "./ConfiguracaoAvaliacao.request";
import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

interface CreateAlternativaRequest {
  descricao: string;
  isCorreto: boolean;
}

export interface CreateQuestaoAvaliacaoRequest {
  questaoId?: number;
  ordem: number;
  pontuacao: number;
  titulo?: string;
  descricao?: string;
  tipoQuestao?: TipoQuestaoEnum;
  dificuldade?: DificuldadeQuestaoEnum;
  alternativas?: CreateAlternativaRequest[];
  exemploRespostaIa?: string;
  textoRevisao?: string;
}

export interface CreateArquivoAvaliacaoRequest {
  arquivoId: number;
  permitirConsultaPorEstudante: boolean;
}

export interface CreateAvaliacaoRequest {
  titulo: string;
  descricao: string;
  isModelo: boolean;
  paiId?: number;
  configuracoesAvaliacao: CreateConfiguracaoAvaliacaoRequest;
  questoes: CreateQuestaoAvaliacaoRequest[];
  arquivos: CreateArquivoAvaliacaoRequest[];
}

export type UpdateAvaliacaoRequest = CreateAvaliacaoRequest;
