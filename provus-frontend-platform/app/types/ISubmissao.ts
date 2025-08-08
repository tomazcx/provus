import type EstadoSubmissaoEnum from "@/enums/EstadoSubmissaoEnum";
import type { IQuestao } from "./IQuestao";

export interface ISubmissao {
  id: number;
  iniciadoEm?: string;
  finalizadoEm?: string;
  pontuacaoTotal: number;
  aluno: {
    id: number;
    nome: string;
    email: string;
  };
  estado: EstadoSubmissaoEnum;
  questoesRespondidas: IQuestao[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ISubmissaoResponse {
  applicationId: number;
  avaliacaoId: number;
  titulo: string;
  descricao?: string;
  pontuacaoTotal: number;
  dataAplicacao: string;
  submissoes: ISubmissao[];
}
