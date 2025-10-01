import type TipoItemEnum from "~/enums/TipoItemEnum";
import type { ArquivoApiResponse } from "./Arquivo.response";
import type { ConfiguracaoAvaliacaoApiResponse } from "./ConfiguracaoAvaliacao.response";
import type { QuestaoApiResponse } from "./Questao.response";
import type { ItemSistemaArquivosApiResponse } from "./ItemSistemaArquivos.response";

export interface AvaliacaoListItemApiResponse
  extends ItemSistemaArquivosApiResponse {
  descricao: string;
  isModelo: boolean;
  path: string;
  questoes: { pontuacao: number }[];
}

interface ArquivosAvaliacoesApiResponse {
  arquivo: ArquivoApiResponse;
  permitirConsultaPorEstudante: boolean;
}

interface QuestoesAvaliacoesApiResponse {
  questao: QuestaoApiResponse;
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
  questoes: QuestoesAvaliacoesApiResponse[];
  configuracaoAvaliacao: ConfiguracaoAvaliacaoApiResponse;
}
