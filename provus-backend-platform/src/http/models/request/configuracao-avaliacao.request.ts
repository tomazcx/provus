import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';

export class CreateConfiguracoesRandomizacaoRequest {
  @ApiProperty({
    description: 'Tipo de randomização',
    example: TipoRandomizacaoEnum.SIMPLES,
  })
  @IsEnum(TipoRandomizacaoEnum)
  @IsNotEmpty()
  tipo: TipoRandomizacaoEnum;

  @ApiProperty({
    description: 'Dificuldade de randomização',
    example: DificuldadeRandomizacaoEnum.FACIL,
  })
  @IsEnum(DificuldadeRandomizacaoEnum)
  @IsNotEmpty()
  dificuldade: DificuldadeRandomizacaoEnum;

  @ApiProperty({
    description: 'Quantidade de questões',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  quantidade: number;

  @ApiProperty({
    description: 'Questões',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  questoes: number[];
}
export class CreateConfiguracoesGeraisRequest {
  @ApiProperty({
    description: 'Tempo máximo da avaliação',
    example: 100,
  })
  @IsInt()
  @IsNotEmpty()
  tempoMaximo: number;

  @ApiProperty({
    description: 'Tempo mínimo da avaliação',
    example: 30,
  })
  @IsInt()
  @IsNotEmpty()
  tempoMinimo: number;

  @ApiProperty({
    description: 'Tipo de aplicação',
    example: 'Manual',
  })
  @IsEnum(TipoAplicacaoEnum)
  @IsNotEmpty()
  tipoAplicacao: TipoAplicacaoEnum;

  @ApiProperty({
    description: 'Data de agendamento',
    example: '2021-01-01',
  })
  @IsDate()
  @IsOptional()
  dataAgendamento: Date;

  @ApiProperty({
    description: 'Mostrar pontuação',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  mostrarPontuacao: boolean;

  @ApiProperty({
    description: 'Permitir revisão',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  permitirRevisao: boolean;

  @ApiProperty({
    description: 'Exibir pontuação das questões',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  exibirPontuacaoQuestoes: boolean;

  @ApiProperty({
    description: 'Configurações de randomização',
    type: [CreateConfiguracoesRandomizacaoRequest],
  })
  @ValidateNested()
  @Type(() => CreateConfiguracoesRandomizacaoRequest)
  configuracoesRandomizacao: CreateConfiguracoesRandomizacaoRequest[];
}

export class CreatePunicaoPorOcorrenciaRequest {
  @ApiProperty({
    description: 'Tipo de infracção',
    example: 'Troca de Abas',
  })
  @IsEnum(TipoInfracaoEnum)
  @IsNotEmpty()
  tipoInfracao: TipoInfracaoEnum;

  @ApiProperty({
    description: 'Quantidade de ocorrências',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  quantidadeOcorrencias: number;

  @ApiProperty({
    description: 'Tipo de penalidade',
    example: 'Notificar professor',
  })
  @IsEnum(TipoPenalidadeEnum)
  @IsNotEmpty()
  tipoPenalidade: TipoPenalidadeEnum;

  @ApiProperty({
    description: 'Pontuação perdida',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  pontuacaoPerdida: number;

  @ApiProperty({
    description: 'Tempo reduzido',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  tempoReduzido: number;

  @ApiProperty({
    description:
      'Aplica esta regra para todas as ocorrências (a partir da quantidade)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  sempre?: boolean;

  @ApiProperty({
    description: 'Limita a aplicação desta regra a um número Y de vezes',
    example: 3,
    required: false,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  quantidadeAplicacoes?: number | null;
}

export class CreateConfiguracoesSegurancaRequest {
  @ApiProperty({
    description: 'Proibir trocar abas',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  proibirTrocarAbas: boolean;

  @ApiProperty({
    description: 'Proibir copiar colar',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  proibirCopiarColar: boolean;

  @ApiProperty({
    description: 'Quantidade de tentativas',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  quantidadeTentativas: number;

  @ApiProperty({
    description: 'Permitir fechar alertas',
    example: true,
  })
  @ApiProperty({
    description: 'Ativar correção discursiva via IA',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  ativarCorrecaoDiscursivaViaIa: boolean;

  @ApiProperty({
    description: 'Punições',
    type: [CreatePunicaoPorOcorrenciaRequest],
  })
  @ValidateNested()
  @Type(() => CreatePunicaoPorOcorrenciaRequest)
  punicoes: CreatePunicaoPorOcorrenciaRequest[];

  @ApiProperty({
    description: 'Notificações',
    example: ['Email', 'Notificação Push'],
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(TipoNotificacaoEnum, { each: true })
  notificacoes: TipoNotificacaoEnum[];
}

export class CreateConfiguracaoAvaliacaoRequest {
  @ApiProperty({
    description: 'Configurações gerais da avaliação',
    type: CreateConfiguracoesGeraisRequest,
  })
  @ValidateNested()
  @Type(() => CreateConfiguracoesGeraisRequest)
  configuracoesGerais: CreateConfiguracoesGeraisRequest;

  @ApiProperty({
    description: 'Configurações segurança da avaliação',
    type: CreateConfiguracoesSegurancaRequest,
  })
  @ValidateNested()
  @Type(() => CreateConfiguracoesSegurancaRequest)
  configuracoesSeguranca: CreateConfiguracoesSegurancaRequest;
}
