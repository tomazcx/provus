export interface IExamBankItem {
  id: number;
  titulo: string;
  tipo: 'pasta' | 'avaliacao';
  criadoEm: string;
  atualizadoEm?: string;
  pai?: number;
  descricao?: string;
  pontuacao?: number;
}

export const mockExamBankResponse: IExamBankItem[] = [
  {
    id: 1,
    titulo: 'Avaliações de História',
    tipo: 'pasta',
    criadoEm: '2025-01-01T10:00:00Z',
    atualizadoEm: '2025-01-15T14:30:00Z',
  },
  {
    id: 2,
    titulo: 'Avaliações de Geografia',
    tipo: 'pasta',
    criadoEm: '2025-01-02T11:00:00Z',
  },
  {
    id: 3,
    titulo: 'Avaliações de Matemática',
    tipo: 'pasta',
    criadoEm: '2025-01-03T09:00:00Z',
  },
  {
    id: 101,
    titulo: 'Período Colonial e Império',
    tipo: 'pasta',
    criadoEm: '2025-01-05T10:00:00Z',
    pai: 1,
  },
  {
    id: 201,
    titulo: 'Avaliação de História do Brasil',
    tipo: 'avaliacao',
    criadoEm: '2025-01-10T14:00:00Z',
    atualizadoEm: '2025-01-15T16:00:00Z',
    pai: 101,
    descricao: 'Uma avaliação sobre o período colonial e o império no Brasil.',
    pontuacao: 20,
  },
  {
    id: 202,
    titulo: 'Prova de História - Independência',
    tipo: 'avaliacao',
    criadoEm: '2025-01-12T10:30:00Z',
    pai: 101,
    descricao: 'Avaliação focada no processo de independência do Brasil.',
    pontuacao: 15,
  },
];