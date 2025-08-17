import type { Questao } from '../questao';
import { Avaliacao } from '../avaliacao';

export class QuestoesAvaliacoes {
  id: number;
  questao: Questao;
  avaliacao: Avaliacao;
  pontuacao: number;
  ordem: number;
}
