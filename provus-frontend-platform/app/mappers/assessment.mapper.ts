import type { AvaliacaoApiResponse } from "~/types/api/response/Avaliacao.response";
import type {
  AvaliacaoEntity,
  ArquivoAvaliacaoEntity,
} from "~/types/entities/Avaliacao.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import TipoItemEnum from "~/enums/TipoItemEnum";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";

export function mapAvaliacaoApiResponseToEntity(
  apiResponse: AvaliacaoApiResponse
): AvaliacaoEntity {
  const questoesEntity: QuestaoEntity[] = apiResponse.questoes.map((qa) => ({
    id: qa.id,
    titulo: qa.titulo,
    tipo: TipoItemEnum.QUESTAO,
    paiId: qa.paiId,
    criadoEm: qa.criadoEm,
    atualizadoEm: qa.atualizadoEm,
    dificuldade: qa.dificuldade,
    tipoQuestao: qa.tipoQuestao,
    descricao: qa.descricao,
    isModelo: qa.isModelo,
    alternativas: qa.alternativas ?? [],
    exemploRespostaIa: qa.exemploRespostaIa,
    textoRevisao: qa.textoRevisao,
    path: qa.path,
    pontuacao: qa.pontuacao,
  }));
  const arquivosEntity: ArquivoAvaliacaoEntity[] = apiResponse.arquivos.map(
    (aa) => ({
      permitirConsultaPorEstudante: aa.permitirConsultaPorEstudante,
      arquivo: {
        ...aa.arquivo,
        tipo: TipoItemEnum.ARQUIVO,
      } as ArquivoEntity,
    })
  );

  return {
    id: apiResponse.id,
    titulo: apiResponse.titulo,
    tipo: TipoItemEnum.AVALIACAO,
    paiId: apiResponse.paiId,
    criadoEm: apiResponse.criadoEm,
    atualizadoEm: apiResponse.atualizadoEm,
    descricao: apiResponse.descricao,
    isModelo: apiResponse.isModelo,
    path: apiResponse.path,
    pontuacao: questoesEntity.reduce((acc, q) => acc + (q.pontuacao || 0), 0),
    questoes: questoesEntity,
    arquivos: arquivosEntity,
    configuracao: {
      configuracoesGerais: {
        ...apiResponse.configuracaoAvaliacao.configuracoesGerais,
        dataAgendamento: apiResponse.configuracaoAvaliacao.configuracoesGerais
          .dataAgendamento
          ? new Date(
              apiResponse.configuracaoAvaliacao.configuracoesGerais.dataAgendamento
            )
          : null,
        configuracoesRandomizacao:
          apiResponse.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.map(
            (rule) => ({
              id: Math.random(),
              ...rule,
              questoes: (rule.questoes ?? []).map((q) => ({
                ...q,
                tipo: TipoItemEnum.QUESTAO,
              })),
            })
          ),
      },
      configuracoesSeguranca: {
        ...apiResponse.configuracaoAvaliacao.configuracoesSeguranca,
        notificacoes:
          apiResponse.configuracaoAvaliacao.configuracoesSeguranca.notificacoes.map(
            (nObj) => nObj.tipoNotificacao
          ),
      },
    },
  };
}
