import EstadoAvaliacaoEnum from '../enums/EstadoAvaliacaoEnum';

export interface IAvaliacao {
  id: number;
  titulo: string;
  path?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  pontuacao?: number;
  descricao?: string;
  isModelo?: boolean;
  questoes?: any[];
  configuracoes?: any;
}

export const mockAvaliacao: IAvaliacao = {
  id: 101,
  titulo: 'Avaliação de História do Brasil',
  path: '/',
  criadoEm: '2025-08-01T10:00:00Z',
  atualizadoEm: '2025-08-05T14:30:00Z',
  pontuacao: 20,
  descricao: 'Uma avaliação sobre o período colonial e o império no Brasil.',
  isModelo: true,
  questoes: [
    {
      id: 2001,
      titulo: 'Quem foi o primeiro imperador do Brasil?',
      tipo: 'OBJETIVA',
      dificuldade: 'FACIL',
      pontuacao: 10,
      alternativas: [
        { id: 3001, descricao: 'Dom João VI', isCorreto: false },
        { id: 3002, descricao: 'Dom Pedro I', isCorreto: true },
        { id: 3003, descricao: 'Dom Pedro II', isCorreto: false },
        { id: 3004, descricao: 'Marechal Deodoro', isCorreto: false },
      ],
    },
    {
      id: 2002,
      titulo:
        'Discorra sobre a importância da Lei Áurea para a sociedade brasileira da época.',
      tipo: 'DISCURSIVA',
      dificuldade: 'MEDIO',
      pontuacao: 10,
      exemploDeResposta:
        'A Lei Áurea, assinada em 1888 pela Princesa Isabel, foi o diploma legal que extinguiu a escravidão no Brasil...',
    },
  ],
};

export const mockAvaliacaoGeografia: IAvaliacao = {
  id: 102,
  titulo: 'Avaliação de Geografia Agendada',
  path: '/',
  criadoEm: '2025-08-08T11:00:00Z',
  atualizadoEm: '2025-08-08T11:00:00Z',
  pontuacao: 15,
  descricao: 'Um teste sobre os biomas brasileiros e relevo.',
  isModelo: true,
  questoes: [
    {
      id: 2003,
      titulo:
        'Qual bioma brasileiro é conhecido por sua vasta planície inundável?',
      tipo: 'OBJETIVA',
      dificuldade: 'FACIL',
      pontuacao: 5,
      alternativas: [
        { id: 3005, descricao: 'Amazônia', isCorreto: false },
        { id: 3006, descricao: 'Cerrado', isCorreto: false },
        { id: 3007, descricao: 'Pantanal', isCorreto: true },
        { id: 3008, descricao: 'Caatinga', isCorreto: false },
      ],
    },
    {
      id: 2004,
      titulo:
        'Descreva as principais características do bioma da Mata Atlântica.',
      tipo: 'DISCURSIVA',
      dificuldade: 'MEDIO',
      pontuacao: 10,
      exemploDeResposta:
        'A Mata Atlântica é uma floresta tropical que se estende pela costa litorânea do Brasil. Caracteriza-se por alta biodiversidade, com grande variedade de espécies de fauna e flora, clima quente e úmido, e um relevo acidentado.',
    },
  ],
};