import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';

export class CreateConfiguracoesRandomizacaoDto {
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: number[];
}

export class CreateConfiguracoesGeraisDto {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  configuracoesRandomizacao: CreateConfiguracoesRandomizacaoDto[];
}

export class CreatePunicaoPorOcorrenciaDto {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
  sempre?: boolean;
  quantidadeAplicacoes?: number | null;
}

export class CreateConfiguracoesSegurancaDto {
  proibirTrocarAbas: boolean;
  proibirCopiarColar: boolean;
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: CreatePunicaoPorOcorrenciaDto[];
  notificacoes: TipoNotificacaoEnum[];
}

export class CreateConfiguracoesAvaliacaoDto {
  configuracoesGerais: CreateConfiguracoesGeraisDto;
  configuracoesSeguranca: CreateConfiguracoesSegurancaDto;
}
