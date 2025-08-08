import type { ISubmissaoResponse } from "~/types/ISubmissao";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import EstadoRespostaEnum from "~/enums/EstadoRespostaEnum";
import { mockAvaliacao } from "./mockAvaliacao";
import type { IQuestaoDiscursiva, IQuestaoObjetiva } from "~/types/IQuestao";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";

const questao1_original = mockAvaliacao.questoes.find(
  (q) => q.id === 2001
)! as IQuestaoObjetiva;
const questao2_original = mockAvaliacao.questoes.find(
  (q) => q.id === 2002
)! as IQuestaoDiscursiva;

export const mockSubmissionResponse: ISubmissaoResponse = {
  avaliacaoId: 101,
  applicationId: 1,
  titulo: "Mathematics Quiz - Chapter 1",
  descricao: "Uma avaliação sobre o período colonial e o império no Brasil.",
  dataAplicacao: "2024-03-15T00:00:00Z",
  pontuacaoTotal: 20,
  submissoes: [
    {
      id: 1,
      iniciadoEm: "2024-03-15T10:20:00Z",
      finalizadoEm: "2024-03-15T10:45:00Z",
      pontuacaoTotal: 19,

      aluno: {
        id: 201,
        nome: "Emma Johnson",
        email: "emma.johnson@school.edu",
      },
      estado: EstadoSubmissaoEnum.AVALIADA,
      questoesRespondidas: [
        {
          ...questao1_original,
          resposta: {
            id: 101,
            dados: { alternativaId: 3002 },
            submissaoId: 1,
            questaoId: 2001,
            pontuacao: 19,
            estadoProcessamento: EstadoRespostaEnum.CORRIGIDA,
            estadoCorrecao: EstadoQuestaoCorrigida.CORRETA,
          },
        },
        {
          ...questao2_original,
          resposta: {
            id: 102,
            dados: {
              texto:
                "A Lei Áurea foi muito importante pois libertou os escravos em 1888...",
            },
            submissaoId: 1,
            questaoId: 2002,
            pontuacao: 6,
            estadoProcessamento: EstadoRespostaEnum.CORRIGIDA,
            estadoCorrecao: EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA,
            textoRevisao:
              "Ótima resposta, mas poderia detalhar mais as consequências sociais.",
          },
        },
      ],
    },
    {
      id: 2,
      iniciadoEm: "2024-03-15T10:20:15Z",
      finalizadoEm: "2024-03-15T10:52:15Z",
      pontuacaoTotal: 4,
      aluno: {
        id: 202,
        nome: "Michael Chen",
        email: "michael.chen@school.edu",
      },
      estado: EstadoSubmissaoEnum.AVALIADA,
      questoesRespondidas: [
        {
          ...questao1_original,
          resposta: {
            id: 201,
            dados: { alternativaId: 3003 },
            submissaoId: 2,
            questaoId: 2001,
            pontuacao: 0,
            estadoProcessamento: EstadoRespostaEnum.CORRIGIDA,
            estadoCorrecao: EstadoQuestaoCorrigida.INCORRETA,
          },
        },
        {
          ...questao2_original,
          resposta: {
            id: 202,
            dados: { texto: "Foi a lei que acabou com a escravidão." },
            submissaoId: 2,
            questaoId: 2002,
            pontuacao: 4,
            estadoProcessamento: EstadoRespostaEnum.CORRIGIDA,
            estadoCorrecao: EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA,
            textoRevisao: "Resposta correta, mas muito superficial.",
          },
        },
      ],
    },
    {
      id: 3,
      iniciadoEm: "2024-03-15T10:10:00Z",
      finalizadoEm: "2024-03-15T10:15:00Z",
      pontuacaoTotal: 0,
      aluno: {
        id: 203,
        nome: "Jessica Brown",
        email: "jessica.brown@school.edu",
      },
      estado: EstadoSubmissaoEnum.ABANDONADA,
      questoesRespondidas: [],
    },
  ],
};
