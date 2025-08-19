import { Questao } from './questao.entity';

export class Alternativa {
  id: number;
  questao: Questao;
  titulo: string;
  descricao: string;
  isCorreto: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
