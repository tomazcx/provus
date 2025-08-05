import type EstadoAvaliacaoEnum from "@/enums/EstadoAvaliacaoEnum";
import type { IQuestao } from "./IQuestao";
import type { IConfiguracoes } from "./IConfiguracoesAvaliacoes";
import type { IFolder, ItemSistemaDeArquivos } from "./IBank";

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

export interface IAvaliacaoImpl extends ItemSistemaDeArquivos {
  titulo: string;
  pontuacao: number;
  descricao: string;
  isModelo: boolean;
  questoes: IQuestao[];
  configuracoes: IConfiguracoes;
}

export type TExamBankItem = IFolder | IAvaliacaoImpl;
