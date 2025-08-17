import EstadoAplicacaoEnum from 'src/domain/enums/estado-aplicacao.enum';
import type { Avaliacao } from '../avaliacao';
import type { Submissao } from '../submissao';

export class Aplicacao {
  id: number;
  avaliacao: Avaliacao;
  codigoAcesso: string;
  dataInicio: Date;
  dataFim: Date;
  estado: EstadoAplicacaoEnum;
  submissoes: Submissao[];
}
