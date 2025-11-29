import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { AvaliacaoDto } from '../avaliacao/avaliacao.dto';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import { ConfiguracaoAvaliacaoDto } from '../configuracao-avaliacao/configuracao-avaliacao.dto';

export class AplicacaoStatsDto {
  totalSubmissoes: number;
  submissoesFinalizadas: number;
  taxaDeConclusaoPercentual: number;
  mediaGeralPercentual: number | null;
  maiorNotaPercentual: number | null;
  menorNotaPercentual: number | null;
  tempoMedioMinutos: number | null;
  pontuacaoTotalAvaliacao: number;
  finalScores?: number[];
}

export class AplicacaoViolationDto {
  id: number;
  estudanteNome: string;
  estudanteEmail: string;
  tipoInfracao: TipoInfracaoEnum;
  timestamp: string;
}

export class AplicacaoDto {
  id: number;
  avaliacao: AvaliacaoDto;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: string;
  dataFim: string;
  stats?: AplicacaoStatsDto;
  violations?: AplicacaoViolationDto[];
  configuracao?: ConfiguracaoAvaliacaoDto;

  constructor(
    model: AplicacaoModel,
    avaliacaoDto: AvaliacaoDto,
    stats?: AplicacaoStatsDto,
    violations?: AplicacaoViolationDto[],
  ) {
    this.id = model.id;
    this.avaliacao = avaliacaoDto;
    this.codigoAcesso = model.codigoAcesso;
    this.estado = model.estado;
    this.dataInicio = model.dataInicio?.toISOString();
    this.dataFim = model.dataFim?.toISOString();
    this.stats = stats;
    this.violations = violations;

    if (model.configuracao) {
      this.configuracao = new ConfiguracaoAvaliacaoDto(model.configuracao);
    }
  }
}
