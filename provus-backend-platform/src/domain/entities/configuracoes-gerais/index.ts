import TipoAplicacaoEnum from 'src/domain/enums/tipo-aplicacao.enum';
import { ConfiguracoesRandomizacao } from '../configuracoes-randomizacao';

export class ConfiguracoesGerais {
  id: number;
  configuracoesRandomizacao: ConfiguracoesRandomizacao[];
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento?: Date;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  permitirConsultarAnexos: boolean;
}
