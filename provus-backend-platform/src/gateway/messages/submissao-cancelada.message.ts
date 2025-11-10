import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';

export interface SubmissaoCanceladaMessage {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
}
