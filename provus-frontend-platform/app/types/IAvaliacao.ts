import type EstadoAvaliacaoEnum from "@/enums/EstadoAvaliacaoEnum";
import type { IQuestao } from "./IQuestao";
import type { IConfiguracoes } from "./IConfiguracoesAvaliacoes";

export interface IAvaliacao {
  id: number;
  titulo: string;
  descricao?: string;
  hash?: string;
  isModelo?: boolean;
  estado: EstadoAvaliacaoEnum;
  codigoDeAcesso?: string;
  pontuacao?: number;
  criadoEm?: string;
  atualizadoEm?: string;
  dataAgendamento?: string;
}


export type AvaliacaoImpl = {
  titulo: string;
  pontuacao: number;
  descricao: string;
  isModelo: boolean;
  questoes: IQuestao[];
  configuracoes: IConfiguracoes;
}
