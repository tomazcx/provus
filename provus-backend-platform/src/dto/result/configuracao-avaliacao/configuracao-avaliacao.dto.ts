import { ConfiguracaoAvaliacaoModel } from 'src/database/config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from 'src/database/config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from 'src/database/config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from 'src/database/config/models/punicao-por-ocorrencia.model';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';

export class ConfiguracaoGeralDto {
  id: number;
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date;
  mostrarPontuacao: boolean;
  exibirPontuacaoQuestoes: boolean;
  permitirConsultarAnexos: boolean;

  constructor(model: ConfiguracoesGeraisModel) {
    this.id = model.id;
    this.tempoMaximo = model.tempoMaximo;
    this.tempoMinimo = model.tempoMinimo;
    this.tipoAplicacao = model.tipoAplicacao;
    this.dataAgendamento = model.dataAgendamento;
    this.mostrarPontuacao = model.mostrarPontuacao;
    this.exibirPontuacaoQuestoes = model.exibirPontuacaoQuestoes;
    this.permitirConsultarAnexos = model.permitirConsultarAnexos;
  }
}

export class PunicaoPorOcorrenciaDto {
  id: number;
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;

  constructor(model: PunicaoPorOcorrenciaModel) {
    this.id = model.id;
    this.tipoInfracao = model.tipoInfracao;
    this.quantidadeOcorrencias = model.quantidadeOcorrencias;
    this.tipoPenalidade = model.tipoPenalidade;
    this.pontuacaoPerdida = model.pontuacaoPerdida;
    this.tempoReduzido = model.tempoReduzido;
  }
}

export class ConfiguracaoSegurancaDto {
  id: number;
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
  punicoes: PunicaoPorOcorrenciaDto[];
  ipsPermitidos: string[];
  notificacoes: TipoNotificacaoEnum[];

  constructor(model: ConfiguracoesSegurancaModel) {
    this.id = model.id;
    this.proibirTrocarAbas = model.proibirTrocarAbas;
    this.proibirPrintScreen = model.proibirPrintScreen;
    this.proibirCopiarColar = model.proibirCopiarColar;
    this.proibirDevtools = model.proibirDevtools;
    this.quantidadeTentativas = model.quantidadeTentativas;
    this.quantidadeAcessosSimultaneos = model.quantidadeAcessosSimultaneos;
    this.ativarControleIp = model.ativarControleIp;
    this.duracaoAlertas = model.duracaoAlertas;
    this.permitirFecharAlertas = model.permitirFecharAlertas;
    this.ativarCorrecaoDiscursivaViaIa = model.ativarCorrecaoDiscursivaViaIa;
    this.punicoes = model.punicoes.map(
      (punicao) => new PunicaoPorOcorrenciaDto(punicao),
    );
    this.ipsPermitidos = model.ipsPermitidos.map((ip) => ip.ip);
    this.notificacoes = model.notificacoes.map(
      (notificacao) => notificacao.tipoNotificacao,
    );
  }
}

export class ConfiguracaoAvaliacaoDto {
  id: number;
  configuracoesGerais: ConfiguracaoGeralDto;
  configuracoesSeguranca: ConfiguracaoSegurancaDto;

  constructor(model: ConfiguracaoAvaliacaoModel) {
    this.id = model.id;
    this.configuracoesGerais = new ConfiguracaoGeralDto(
      model.configuracoesGerais,
    );
    this.configuracoesSeguranca = new ConfiguracaoSegurancaDto(
      model.configuracoesSeguranca,
    );
  }
}
