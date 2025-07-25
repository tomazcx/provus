import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IFolder } from "~/types/IBank";
import type { IQuestao } from "~/types/IQuestao";

export const mockQuestionBankResponse: (IFolder | IQuestao)[] = [
  {
    id: 1,
    titulo: "Algebra",
    path: "/",
    criadoEm: "2023-10-01T10:00:00Z",
    atualizadoEm: "2023-10-01T10:00:00Z",
    filhos: [],
  },
  {
    id: 2,
    titulo: "Geometria",
    path: "/",
    criadoEm: "2023-10-01T10:00:00Z",
    atualizadoEm: "2023-10-01T10:00:00Z",
    filhos: [],
  },
  {
    id: 3,
    titulo: "Equações Quadráticas",
    path: "/",
    criadoEm: "2023-10-01T10:00:00Z",
    atualizadoEm: "2023-10-01T10:00:00Z",
    descricao: "Resolva as equações quadráticas usando a fórmula de Bhaskara.",
    dificuldade: DificuldadeQuestaoEnum.MEDIO,
    exemploDeResposta: "",
    pontuacao: 0,
    isModelo: true,
    tipo: TipoQuestaoEnum.OBJETIVA,
  },
  {
    id: 4,
    titulo: "Equações Diferenciais",
    path: "/",
    criadoEm: "2023-10-01T10:00:00Z",
    atualizadoEm: "2023-10-01T10:00:00Z",
    descricao: "Resolva as equações diferenciais de primeira ordem.",
    dificuldade: DificuldadeQuestaoEnum.DIFICIL,
    exemploDeResposta: "",
    pontuacao: 0,
    isModelo: true,
    tipo: TipoQuestaoEnum.OBJETIVA,
  },

  {
    id: 10,
    titulo: "Geometria Analítica",
    path: "/Geometria",
    criadoEm: "2023-10-01T10:00:00Z",
    atualizadoEm: "2023-10-01T10:00:00Z",
    descricao:
      "Resolva os problemas de geometria analítica usando coordenadas cartesianas.",
    dificuldade: DificuldadeQuestaoEnum.MEDIO,
    exemploDeResposta: "",
    pontuacao: 0,
    isModelo: true,
    tipo: TipoQuestaoEnum.OBJETIVA,
  },
];
