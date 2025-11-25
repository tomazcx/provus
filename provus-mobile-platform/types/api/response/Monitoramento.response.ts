import { EstadoSubmissaoEnum } from "../../../enums/EstadoSubmissaoEnum";
import { TipoAtividadeEnum } from "../../../enums/TipoAtividadeEnum";

export interface ProgressoAlunoApiResponse {
  submissaoId: number;
  aluno: { id?: number; nome: string; email: string };
  estado: EstadoSubmissaoEnum;
  progresso: number;
  questoesRespondidas: number;
  totalQuestoes: number;
  horaInicio: string;
  alertas: number;
  tempoPenalidadeEmSegundos?: number;
}

export interface LogAtividadeApiResponse {
  id: number;
  tipo: TipoAtividadeEnum;
  alunoNome: string;
  descricao: string;
  timestamp: string;
}

export interface MonitoramentoInicialResponseDto {
  alunos: ProgressoAlunoApiResponse[];
  atividadesRecentes: LogAtividadeApiResponse[];
}
