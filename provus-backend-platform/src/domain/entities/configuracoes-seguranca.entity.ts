import { ConfiguracaoNotificacao } from './configuracao-notificacao.entity';
import { PunicaoPorOcorrencia } from './punicao-por-ocorrencia.entity';

export class ConfiguracoesSeguranca {
  id: number;
  proibirTrocarAbas: boolean;
  proibirPrintScreen: boolean;
  proibirCopiarEColar: boolean;
  proibirDevtools: boolean;
  punicoes: PunicaoPorOcorrencia[];
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarControleIp: boolean;
  duracaoAlertas: number;
  permitirFecharAlertas: boolean;
  ativarCorrecaoDiscursivaViaIa: boolean;
  notificacoes: ConfiguracaoNotificacao[];
  ipsPermitidos: string[];
}
