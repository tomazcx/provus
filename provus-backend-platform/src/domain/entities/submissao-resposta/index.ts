import { Questao } from '../questao';
import { Submissao } from '../submissao';

export class SubmissaoResposta {
  questao: Questao;
  submissao: Submissao;
  dadosResposta: Date;
  pontuacao: number;
  atualizadoEm: Date;
}
