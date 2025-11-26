import type EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import type TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";

export interface IProgressoAluno {
  submissaoId: number;
  aluno: {
    id: number;
    nome: string;
    email: string;
  };
  estado: EstadoSubmissaoEnum;
  progresso: number;
  questoesRespondidas: number;
  totalQuestoes: number;
  horaInicio: string;
  alertas: number;
  tempoPenalidadeEmSegundos?: number;
}

export interface ILogAtividade {
  id: number;
  tipo: TipoAtividadeEnum;
  alunoNome: string;
  descricao: string;
  timestamp: string;
}
