import type { Questao } from './questao.entity';
import { Avaliacao } from './avaliacao.entity';

export class QuestoesAvaliacoes {
  id: number;
  questao: Questao;
  avaliacao: Avaliacao;
  pontuacao: number;
  ordem: number;
}
