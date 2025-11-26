import { AplicacaoEntity } from "../types/entities/Aplicacao.entity";
import { EstadoAplicacaoEnum } from "../enums/EstadoAplicacaoEnum";
import { AplicacaoApiResponse } from "../types/api/response/Aplicacao.response";

export function mapAplicacaoApiResponseToEntity(
  apiResponse: AplicacaoApiResponse
): AplicacaoEntity {
  return {
    id: apiResponse.id,
    codigoAcesso: apiResponse.codigoAcesso,
    estado: apiResponse.estado as EstadoAplicacaoEnum,
    dataInicio: new Date(apiResponse.dataInicio),
    dataFim: new Date(apiResponse.dataFim),
    totalSubmissoes: apiResponse.totalSubmissoes,
    mediaGeralPercentual: apiResponse.mediaGeralPercentual,
    avaliacao: {
      id: apiResponse.avaliacao.id,
      titulo: apiResponse.avaliacao.titulo,
      descricao: apiResponse.avaliacao.descricao,
      pontuacao: apiResponse.avaliacao.pontuacao || 0,
    },
    stats: apiResponse.stats
      ? {
          totalSubmissoes: apiResponse.stats.totalSubmissoes,
          submissoesFinalizadas: apiResponse.stats.submissoesFinalizadas,
          taxaDeConclusaoPercentual:
            apiResponse.stats.taxaDeConclusaoPercentual,
          mediaGeralPercentual: apiResponse.stats.mediaGeralPercentual,
          maiorNotaPercentual: apiResponse.stats.maiorNotaPercentual,
          menorNotaPercentual: apiResponse.stats.menorNotaPercentual,
          tempoMedioMinutos: apiResponse.stats.tempoMedioMinutos,
          pontuacaoTotalAvaliacao: apiResponse.stats.pontuacaoTotalAvaliacao,
          finalScores: apiResponse.stats.finalScores,
        }
      : undefined,
    violations: apiResponse.violations
      ? apiResponse.violations.map((v) => ({
          id: v.id,
          estudanteNome: v.estudanteNome,
          estudanteEmail: v.estudanteEmail,
          tipoInfracao: v.tipoInfracao,
          timestamp: v.timestamp,
        }))
      : undefined,
  };
}
