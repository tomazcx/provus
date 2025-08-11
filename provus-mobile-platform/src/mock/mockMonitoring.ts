import EstadoSubmissaoEnum from '../enums/EstadoSubmissaoEnum';
import TipoAtividadeEnum from '../enums/TipoAtividadeEnum';
import { IMonitoringData, IProgressoAluno, ILogAtividade } from '../types/Monitoring';

const progressoDosAlunosSalvos: IProgressoAluno[] = [
  {
    submissaoId: 1,
    aluno: { id: 201, nome: 'Emma Johnson', email: 'emma.johnson@school.edu' },
    estado: EstadoSubmissaoEnum.AVALIADA,
    progresso: 100,
    questoesRespondidas: 2,
    totalQuestoes: 2,
    horaInicio: '2024-03-15T10:20:00Z',
    alertas: 0,
  },
  {
    submissaoId: 2,
    aluno: { id: 202, nome: 'Michael Chen', email: 'michael.chen@school.edu' },
    estado: EstadoSubmissaoEnum.AVALIADA,
    progresso: 100,
    questoesRespondidas: 2,
    totalQuestoes: 2,
    horaInicio: '2024-03-15T10:20:15Z',
    alertas: 0,
  },
  {
    submissaoId: 3,
    aluno: { id: 203, nome: 'Jessica Brown', email: 'jessica.brown@school.edu' },
    estado: EstadoSubmissaoEnum.ABANDONADA,
    progresso: 0,
    questoesRespondidas: 0,
    totalQuestoes: 2,
    horaInicio: '2024-03-15T10:10:00Z',
    alertas: 0,
  },
];

const progressoDosAlunosAtivos: IProgressoAluno[] = [
  {
    submissaoId: 4,
    aluno: { id: 204, nome: 'Alice Johnson', email: 'alice.j@school.edu' },
    estado: EstadoSubmissaoEnum.INICIADA,
    progresso: 70,
    questoesRespondidas: 7,
    totalQuestoes: 10,
    horaInicio: '2024-03-15T10:30:00Z',
    alertas: 1,
  },
  {
    submissaoId: 5,
    aluno: { id: 205, nome: 'David Wilson', email: 'david.w@school.edu' },
    estado: EstadoSubmissaoEnum.INICIADA,
    progresso: 30,
    questoesRespondidas: 3,
    totalQuestoes: 10,
    horaInicio: '2024-03-15T10:35:00Z',
    alertas: 2,
  },
];

const logDeAtividades: ILogAtividade[] = [
  {
    id: 1,
    tipo: TipoAtividadeEnum.ENTROU,
    alunoNome: 'Emma Johnson',
    descricao: 'iniciou a avaliação.',
    timestamp: '2024-03-15T10:20:00Z',
  },
  {
    id: 2,
    tipo: TipoAtividadeEnum.ENTROU,
    alunoNome: 'Michael Chen',
    descricao: 'iniciou a avaliação.',
    timestamp: '2024-03-15T10:20:15Z',
  },
  {
    id: 3,
    tipo: TipoAtividadeEnum.PENALIDADE,
    alunoNome: 'David Wilson',
    descricao: 'recebeu um alerta por troca de aba.',
    timestamp: '2024-03-15T10:40:15Z',
  },
  {
    id: 5,
    tipo: TipoAtividadeEnum.FINALIZOU,
    alunoNome: 'Emma Johnson',
    descricao: 'finalizou a avaliação.',
    timestamp: '2024-03-15T10:45:00Z',
  },
];

export const mockMonitoringResponse: IMonitoringData = {
  applicationId: 1,
  progressoAlunos: [...progressoDosAlunosSalvos, ...progressoDosAlunosAtivos],
  atividades: logDeAtividades.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ),
};