import { ApiProperty } from '@nestjs/swagger';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';

class PunicaoPorOcorrenciaResponse {
  @ApiProperty({
    description: 'ID da punição por ocorrência',
    example: 1,
  })
  id: number;

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
}

class ConfiguracaoSegurancaResponse {
  @ApiProperty({
    description: 'ID da configuração de segurança',
    example: 1,
  })
  id: number;

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
}

class ConfiguracaoGeralResponse {
  @ApiProperty({
    description: 'ID da configuração geral',
    example: 1,
  })
  id: number;

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

  @ApiProperty({
    description: 'Permitir consultar anexos',
    example: true,
  })
  permitirConsultarAnexos: boolean;
}

export class ConfiguracaoAvaliacaoResponse {
  @ApiProperty({
    description: 'ID da configuração de avaliação',
    example: 1,
  })
  id: number;

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
}
