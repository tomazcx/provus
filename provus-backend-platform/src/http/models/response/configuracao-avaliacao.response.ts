import { ApiProperty } from '@nestjs/swagger';
import { ConfiguracaoAvaliacaoModel } from 'src/database/config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from 'src/database/config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from 'src/database/config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from 'src/database/config/models/punicao-por-ocorrencia.model';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';

class PunicaoPorOcorrenciaResponse {
  @ApiProperty({
    description: 'Tipo de infracção',
    example: 'Troca de Abas',
  })
  tipoInfracao: TipoInfracaoEnum;

  @ApiProperty({
    description: 'Quantidade de ocorrências',
    example: 3,
  })
  quantidadeOcorrencias: number;

  @ApiProperty({
    description: 'Tipo de penalidade',
    example: 'Notificar professor',
  })
  tipoPenalidade: TipoPenalidadeEnum;

  @ApiProperty({
    description: 'Pontuação perdida',
    example: 10,
  })
  pontuacaoPerdida: number;

  @ApiProperty({
    description: 'Tempo reduzido',
    example: 10,
  })
  tempoReduzido: number;

  static fromModel(
    model: PunicaoPorOcorrenciaModel,
  ): PunicaoPorOcorrenciaResponse {
    const response = new PunicaoPorOcorrenciaResponse();
    response.tipoInfracao = model.tipoInfracao;
    response.quantidadeOcorrencias = model.quantidadeOcorrencias;
    response.tipoPenalidade = model.tipoPenalidade;
    response.pontuacaoPerdida = model.pontuacaoPerdida;
    response.tempoReduzido = model.tempoReduzido;
    return response;
  }
}

class ConfiguracaoSegurancaResponse {
  @ApiProperty({
    description: 'Proibir trocar abas',
    example: true,
  })
  proibirTrocarAbas: boolean;

  @ApiProperty({
    description: 'Proibir print screen',
    example: true,
  })
  proibirPrintScreen: boolean;

  @ApiProperty({
    description: 'Proibir copiar colar',
    example: true,
  })
  proibirCopiarColar: boolean;

  @ApiProperty({
    description: 'Proibir devtools',
    example: true,
  })
  proibirDevtools: boolean;

  @ApiProperty({
    description: 'Quantidade de tentativas',
    example: 3,
  })
  quantidadeTentativas: number;

  @ApiProperty({
    description: 'Quantidade de acessos simultâneos',
    example: 3,
  })
  quantidadeAcessosSimultaneos: number;

  @ApiProperty({
    description: 'Ativar controle de IP',
    example: true,
  })
  ativarControleIp: boolean;

  @ApiProperty({
    description: 'Duração dos alertas',
    example: 10,
  })
  duracaoAlertas: number;

  @ApiProperty({
    description: 'Permitir fechar alertas',
    example: true,
  })
  permitirFecharAlertas: boolean;

  @ApiProperty({
    description: 'Ativar correção discursiva via IA',
    example: true,
  })
  ativarCorrecaoDiscursivaViaIa: boolean;

  @ApiProperty({
    description: 'Punições',
    type: PunicaoPorOcorrenciaResponse,
  })
  punicoes: PunicaoPorOcorrenciaResponse[];

  @ApiProperty({
    description: 'IPs permitidos',
    example: ['127.0.0.1'],
  })
  ipsPermitidos: string[];
  notificacoes: TipoNotificacaoEnum[];

  static fromModel(
    model: ConfiguracoesSegurancaModel,
  ): ConfiguracaoSegurancaResponse {
    const response = new ConfiguracaoSegurancaResponse();
    response.proibirTrocarAbas = model.proibirTrocarAbas;
    response.proibirPrintScreen = model.proibirPrintScreen;
    response.proibirCopiarColar = model.proibirCopiarColar;
    response.proibirDevtools = model.proibirDevtools;
    response.quantidadeTentativas = model.quantidadeTentativas;
    response.quantidadeAcessosSimultaneos = model.quantidadeAcessosSimultaneos;
    response.ativarControleIp = model.ativarControleIp;
    response.duracaoAlertas = model.duracaoAlertas;
    response.permitirFecharAlertas = model.permitirFecharAlertas;
    response.ativarCorrecaoDiscursivaViaIa =
      model.ativarCorrecaoDiscursivaViaIa;
    response.punicoes =
      model.punicoes?.map((p) => PunicaoPorOcorrenciaResponse.fromModel(p)) ||
      [];
    response.ipsPermitidos = model.ipsPermitidos?.map((ip) => ip.ip) || [];
    response.notificacoes =
      model.notificacoes?.map((n) => n.tipoNotificacao) || [];
    return response;
  }
}

class ConfiguracaoGeralResponse {
  @ApiProperty({
    description: 'Tempo máximo',
    example: 100,
  })
  tempoMaximo: number;

  @ApiProperty({
    description: 'Tempo mínimo',
    example: 30,
  })
  tempoMinimo: number;

  @ApiProperty({
    description: 'Tipo de aplicação',
    example: 'Manual',
  })
  tipoAplicacao: TipoAplicacaoEnum;

  @ApiProperty({
    description: 'Data de agendamento',
    example: '2021-01-01',
  })
  dataAgendamento: Date;

  @ApiProperty({
    description: 'Mostrar pontuação',
    example: true,
  })
  mostrarPontuacao: boolean;

  @ApiProperty({
    description: 'Exibir pontuação das questões',
    example: true,
  })
  exibirPontuacaoQuestoes: boolean;

  static fromModel(model: ConfiguracoesGeraisModel): ConfiguracaoGeralResponse {
    const response = new ConfiguracaoGeralResponse();
    response.tempoMaximo = model.tempoMaximo;
    response.tempoMinimo = model.tempoMinimo;
    response.tipoAplicacao = model.tipoAplicacao;
    response.dataAgendamento = model.dataAgendamento;
    response.mostrarPontuacao = model.mostrarPontuacao;
    response.exibirPontuacaoQuestoes = model.exibirPontuacaoQuestoes;
    return response;
  }
}

export class ConfiguracaoAvaliacaoResponse {
  @ApiProperty({
    description: 'Configurações gerais',
    type: ConfiguracaoGeralResponse,
  })
  configuracoesGerais: ConfiguracaoGeralResponse;

  @ApiProperty({
    description: 'Configurações de segurança',
    type: ConfiguracaoSegurancaResponse,
  })
  configuracoesSeguranca: ConfiguracaoSegurancaResponse;

  static fromModel(
    model: ConfiguracaoAvaliacaoModel,
  ): ConfiguracaoAvaliacaoResponse {
    const response = new ConfiguracaoAvaliacaoResponse();
    if (model.configuracoesGerais) {
      response.configuracoesGerais = ConfiguracaoGeralResponse.fromModel(
        model.configuracoesGerais,
      );
    }
    if (model.configuracoesSeguranca) {
      response.configuracoesSeguranca = ConfiguracaoSegurancaResponse.fromModel(
        model.configuracoesSeguranca,
      );
    }
    return response;
  }
}
