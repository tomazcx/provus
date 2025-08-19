import EstadoSubmissaoEnum from 'src/domain/enums/estado-submissao.enum';
import type { Estudante } from '../estudante';
import type { Aplicacao } from '../aplicacao';
import { SubmissaoResposta } from '../submissao-resposta';

export class Submissao {
  id: number;
  aplicacao: Aplicacao;
  hash: string;
  estudante: Estudante;
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: number;
  criadoEm: Date;
  atualizadoEm: Date;
  dataInicio: Date;
  finalizadoEm: Date;
  respostas: SubmissaoResposta[];
}
