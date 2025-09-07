import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';

export class CreateConfiguracoesGeraisDto {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  permitirConsultarAnexos: boolean;
}

export class CreatePunicaoPorOcorrenciaDto {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
}

export class CreateConfiguracoesSegurancaDto {
  proibirTrocarAbas: boolean;
  proibirPrintScreen: boolean;
  proibirCopiarColar: boolean;
  proibirDevtools: boolean;
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarControleIp: boolean;
  duracaoAlertas: number;
  permitirFecharAlertas: boolean;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: CreatePunicaoPorOcorrenciaDto[];
  ipsPermitidos: string[];
  notificacoes: TipoNotificacaoEnum[];
}

export class CreateConfiguracoesRandomizacaoDto {
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
}

export class CreateConfiguracoesAvaliacaoDto {
  configuracoesGerais: CreateConfiguracoesGeraisDto;
  configuracoesSeguranca: CreateConfiguracoesSegurancaDto;
}
