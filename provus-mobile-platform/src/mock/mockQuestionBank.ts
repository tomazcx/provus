export interface IQuestionBankItem {
  id: number;
  titulo: string;
  tipo: 'pasta' | 'questao';
  criadoEm: string;
  atualizadoEm?: string;
  pai?: number;
  questoes?: any[];
}

export const mockQuestionBankResponse: IQuestionBankItem[] = [
  {
    id: 1,
    titulo: 'História do Brasil',
    tipo: 'pasta',
    criadoEm: '2025-01-01T10:00:00Z',
    atualizadoEm: '2025-01-15T14:30:00Z',
  },
  {
    id: 2,
    titulo: 'Geografia',
    tipo: 'pasta',
    criadoEm: '2025-01-02T11:00:00Z',
    atualizadoEm: '2025-01-16T15:00:00Z',
  },
  {
    id: 3,
    titulo: 'Matemática',
    tipo: 'pasta',
    criadoEm: '2025-01-03T09:00:00Z',
  },
  {
    id: 101,
    titulo: 'Período Colonial',
    tipo: 'pasta',
    criadoEm: '2025-01-05T10:00:00Z',
    pai: 1,
  },
  {
    id: 201,
    titulo: 'Qual foi o primeiro imperador do Brasil?',
    tipo: 'questao',
    criadoEm: '2025-01-10T14:00:00Z',
    pai: 101,
  },
  {
    id: 202,
    titulo: 'Discorra sobre a importância da Lei Áurea',
    tipo: 'questao',
    criadoEm: '2025-01-11T15:30:00Z',
    pai: 101,
  },
];