import EstadoSubmissaoEnum from '../enums/EstadoSubmissaoEnum';

export interface ISubmissaoResponse {
  avaliacaoId: number;
  applicationId: number;
  titulo: string;
  descricao?: string;
  dataAplicacao: string;
  pontuacaoTotal: number;
  submissoes: ISubmissao[];
}

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
  questoesRespondidas: any[];
}

export const mockSubmissionResponse: ISubmissaoResponse = {
  avaliacaoId: 101,
  applicationId: 1,
  titulo: 'Mathematics Quiz - Chapter 1',
  descricao: 'Uma avaliação sobre o período colonial e o império no Brasil.',
  dataAplicacao: '2024-03-15T00:00:00Z',
  pontuacaoTotal: 20,
  submissoes: [
    {
      id: 1,
      iniciadoEm: '2024-03-15T10:20:00Z',
      finalizadoEm: '2024-03-15T10:45:00Z',
      pontuacaoTotal: 19,
      aluno: {
        id: 201,
        nome: 'Emma Johnson',
        email: 'emma.johnson@school.edu',
      },
      estado: EstadoSubmissaoEnum.AVALIADA,
      questoesRespondidas: [],
    },
    {
      id: 2,
      iniciadoEm: '2024-03-15T10:20:15Z',
      finalizadoEm: '2024-03-15T10:52:15Z',
      pontuacaoTotal: 4,
      aluno: {
        id: 202,
        nome: 'Michael Chen',
        email: 'michael.chen@school.edu',
      },
      estado: EstadoSubmissaoEnum.AVALIADA,
      questoesRespondidas: [],
    },
    {
      id: 3,
      iniciadoEm: '2024-03-15T10:10:00Z',
      finalizadoEm: '2024-03-15T10:15:00Z',
      pontuacaoTotal: 0,
      aluno: {
        id: 203,
        nome: 'Jessica Brown',
        email: 'jessica.brown@school.edu',
      },
      estado: EstadoSubmissaoEnum.ABANDONADA,
      questoesRespondidas: [],
    },
  ],
};