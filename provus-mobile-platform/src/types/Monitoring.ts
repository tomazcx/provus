import EstadoAplicacaoEnum from '../enums/EstadoAplicacaoEnum';

export interface IAluno {
  id: number;
  nome: string;
  email: string;
}

export interface IProgressoAluno {
  submissaoId: number;
  aluno: IAluno;
  estado: EstadoAplicacaoEnum;
  progresso: number;
  questoesRespondidas: number;
  totalQuestoes: number;
  horaInicio: string;
  alertas: number;
}

export interface ILogAtividade {
  id: number;
  tipo: string;
  alunoNome: string;
  descricao: string;
  timestamp: string;
}

export interface IMonitoringData {
  applicationId: number;
  progressoAlunos: IProgressoAluno[];
  atividades: ILogAtividade[];
}