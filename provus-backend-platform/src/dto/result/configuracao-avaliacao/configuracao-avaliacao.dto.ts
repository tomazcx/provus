import { ConfiguracaoAvaliacaoModel } from 'src/database/config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from 'src/database/config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from 'src/database/config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from 'src/database/config/models/punicao-por-ocorrencia.model';
import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import { ConfiguracoesRandomizacaoModel } from 'src/database/config/models/configuracoes-randomizacao.model';
import { QuestaoResultDto } from '../questao/questao.result';

export class ConfiguracaoRandomizacaoDto {
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: QuestaoResultDto[];

  constructor(model: ConfiguracoesRandomizacaoModel) {
    this.tipo = model.tipo;
    this.dificuldade = model.dificuldade;
    this.quantidade = model.quantidade;
    this.questoes = model.poolDeQuestoes.map(
      (questao) => new QuestaoResultDto(questao),
    );
  }
}

export class ConfiguracaoGeralDto {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date;
  mostrarPontuacao: boolean;
  exibirPontuacaoQuestoes: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  configuracoesRandomizacao: ConfiguracaoRandomizacaoDto[];

  constructor(model: ConfiguracoesGeraisModel) {
    this.tempoMaximo = model.tempoMaximo;
    this.tempoMinimo = model.tempoMinimo;
    this.tipoAplicacao = model.tipoAplicacao;
    this.dataAgendamento = model.dataAgendamento;
    this.mostrarPontuacao = model.mostrarPontuacao;
    this.exibirPontuacaoQuestoes = model.exibirPontuacaoQuestoes;
    this.permitirRevisao = model.permitirRevisao;
    this.permitirMultiplosEnvios = model.permitirMultiplosEnvios;
    this.configuracoesRandomizacao =
      model.configuracoesRandomizacao?.map(
        (configuracao) => new ConfiguracaoRandomizacaoDto(configuracao),
      ) || [];
  }
}
export class PunicaoPorOcorrenciaDto {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
  sempre: boolean;
  quantidadeAplicacoes: number | null;

  constructor(model: PunicaoPorOcorrenciaModel) {
    this.tipoInfracao = model.tipoInfracao;
    this.quantidadeOcorrencias = model.quantidadeOcorrencias;
    this.tipoPenalidade = model.tipoPenalidade;
    this.pontuacaoPerdida = model.pontuacaoPerdida;
    this.tempoReduzido = model.tempoReduzido;
    this.sempre = model.sempre;
    this.quantidadeAplicacoes = model.quantidadeAplicacoes;
  }
}

export class ConfiguracaoSegurancaDto {
  proibirTrocarAbas: boolean;
  proibirCopiarColar: boolean;
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: PunicaoPorOcorrenciaDto[];
  notificacoes: TipoNotificacaoEnum[];

  constructor(model: ConfiguracoesSegurancaModel) {
    this.proibirTrocarAbas = model.proibirTrocarAbas;
    this.proibirCopiarColar = model.proibirCopiarColar;
    this.quantidadeTentativas = model.quantidadeTentativas;
    this.quantidadeAcessosSimultaneos = model.quantidadeAcessosSimultaneos;
    this.ativarCorrecaoDiscursivaViaIa = model.ativarCorrecaoDiscursivaViaIa;
    this.punicoes = model.punicoes.map(
      (punicao) => new PunicaoPorOcorrenciaDto(punicao),
    );
    this.notificacoes = model.notificacoes.map(
      (notificacao) => notificacao.tipoNotificacao,
    );
  }
}

export class ConfiguracaoAvaliacaoDto {
  configuracoesGerais: ConfiguracaoGeralDto;
  configuracoesSeguranca: ConfiguracaoSegurancaDto;

  constructor(model: ConfiguracaoAvaliacaoModel) {
    this.configuracoesGerais = new ConfiguracaoGeralDto(
      model.configuracoesGerais,
    );
    this.configuracoesSeguranca = new ConfiguracaoSegurancaDto(
      model.configuracoesSeguranca,
    );
  }
}
