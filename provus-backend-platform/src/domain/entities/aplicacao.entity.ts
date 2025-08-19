import EstadoAplicacaoEnum from 'src/domain/enums/estado-aplicacao.enum';
import type { Avaliacao } from './avaliacao.entity';
import type { Submissao } from './submissao.entity';

export class Aplicacao {
  id: number;
  avaliacao: Avaliacao;
  codigoAcesso: string;
  dataInicio: Date;
  dataFim: Date;
  estado: EstadoAplicacaoEnum;
  submissoes: Submissao[];
}
