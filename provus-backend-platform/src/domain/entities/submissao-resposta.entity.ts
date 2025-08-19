import { Questao } from './questao.entity';
import { Submissao } from './submissao.entity';

export class SubmissaoResposta {
  questao: Questao;
  submissao: Submissao;
  dadosResposta: Date;
  pontuacao: number;
  atualizadoEm: Date;
}
