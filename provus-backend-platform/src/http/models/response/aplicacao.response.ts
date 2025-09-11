import { ApiProperty } from '@nestjs/swagger';
import { ArquivoResponse } from './arquivo.response';
import { QuestaoResponse } from './questao.response';
import { AvaliacaoResponse } from './avaliacao.response';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import TipoRandomizacaoEnum from 'src/enums/tipo-randomizacao.enum';
import DificuldadeRandomizacaoEnum from 'src/enums/dificuldade-randomizacao.enum';
import { Type } from 'class-transformer';
import { CreateConfiguracaoAvaliacaoRequest } from '../request/configuracao-avaliacao.request';
import { ValidateNested } from 'class-validator';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';

export class ArquivoAplicacaoResponse {
  @ApiProperty({
    description: 'Arquivo da aplicação',
    type: ArquivoResponse,
  })
  arquivo: ArquivoResponse;

  @ApiProperty({
    description: 'Permitir consulta por estudante',
    example: true,
  })
  permitirConsultaPorEstudante: boolean;
}

export class aplicacaoResponse {
  @ApiProperty({
    description: 'ID da aplicação',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Avaliação',
    example: {
      titulo: 'Avaliacao de Matemática',
      descricao: 'Avaliação de Matemática',
      isModelo: true,
      paiId: 1,
      configuracoesAvaliacao: {
        tempoMaximo: 100,
        tempoMinimo: 1,
        tipoAplicacao: TipoAplicacaoEnum.AGENDADA,
        dataAgendamento: new Date(),
        mostrarPontuacao: true,
        permitirRevisao: true,
        permitirMultiplosEnvios: true,
        exibirPontuacaoQuestoes: true,
        configuracoesRandomizacao: {
          tipo: TipoRandomizacaoEnum.SIMPLES,
          dificuldade: DificuldadeRandomizacaoEnum.DIFICIL,
          quantidade: 2,
          questoes: [1, 2, 3],
        },
      },
      questoes: [
        {
          questaoId: 1,
          ordem: 1,
          pontuacao: 1,
        },
        {
          questaoId: 2,
          ordem: 2,
          pontuacao: 2,
        },
        {
          questaoId: 3,
          ordem: 3,
          pontuacao: 3,
        },
      ],
      arquivos: [
        {
          arquivoId: 1,
          permitirConsultaPorEstudante: true,
        },
        {
          arquivoId: 2,
          permitirConsultaPorEstudante: false,
        },
      ],
    },
  })
  avaliacao: AvaliacaoResponse;

  @ApiProperty({
    description: 'Título da aplicação',
    example: 'Avaliação de Matemática',
  })
  titulo: string;

  @ApiProperty({
    description: 'Descrição da aplicação',
    example: 'Avaliação de Matemática',
  })
  descricao: string;

  @ApiProperty({
    description: 'Configurações da aplicação',
    type: CreateConfiguracaoAvaliacaoRequest,
  })
  @ValidateNested()
  @Type(() => CreateConfiguracaoAvaliacaoRequest)
  configuracoesAplicacao: CreateConfiguracaoAvaliacaoRequest;

  @ApiProperty({
    description: 'Questões da aplicação',
    type: [QuestaoResponse],
  })
  questoes: QuestaoResponse[];

  @ApiProperty({
    description: 'Arquivos da aplicação',
    type: [ArquivoAplicacaoResponse],
  })
  arquivos: ArquivoAplicacaoResponse[];

  @ApiProperty({
    description: 'Código de acesso da aplicação',
    example: 'ABC123',
  })
  codigoAcesso: string;

  @ApiProperty({
    description: 'Estado da aplicação',
    example: EstadoAplicacaoEnum.AGENDADA,
  })
  estado: EstadoAplicacaoEnum;

  @ApiProperty({
    description: 'Data de início da aplicação',
    example: new Date().toISOString(),
  })
  dataInicio: string;

  @ApiProperty({
    description: 'Data de fim da aplicação',
    example: new Date().toISOString(),
  })
  dataFim: string;
}
