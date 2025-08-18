import type { Submissao } from '../submissao';

export class Estudante {
  id: number;
  nome: string;
  email: string;
  criadoEm: Date;
  atualizadoEm: Date;
  submissao: Submissao;
}
