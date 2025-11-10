import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';

export interface AlertaEstudanteInfracaoMessage {
  quantidadeOcorrencias: number;
  tipoInfracao: TipoInfracaoEnum;
  penalidade: TipoPenalidadeEnum;
}
