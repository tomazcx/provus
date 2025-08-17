import TipoInfracaoEnum from 'src/domain/enums/tipo-infracao.enum';
import TipoPenalidadeEnum from 'src/domain/enums/tipo-penalidade.enum';

export class PunicaoPorOcorrencia {
  id: number;
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
}
