import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type EstadoRespostaEnum from "~/enums/EstadoRespostaEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { ItemSistemaDeArquivos } from "./IBank";

export interface IQuestao extends ItemSistemaDeArquivos {
  id?: number;
  titulo: string;
  descricao?: string;
  dificuldade?: DificuldadeQuestaoEnum;
  exemploDeResposta?: string;
  pontuacao?: number;
  isModelo?: boolean;
  tipo: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas?: IAlternativa[];
  resposta?: IResposta;
}

export interface IAlternativa {
  id?: number;
  descricao: string;
  isCorreto: boolean;
  questaoId?: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface IResposta {
  id?: number;
  dados: JSON;
  textoRevisao?: string;
  submissaoId: number;
  questaoId: number;
  pontuacao?: number;
  estado: EstadoRespostaEnum;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type TQuestionForm = {
  titulo: string;
  descricao?: string;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
  alternativas: IAlternativa[];
  exemploDeResposta?: string;
  explicacao?: string;
};