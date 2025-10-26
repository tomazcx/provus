import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import { SubmissaoResultDto } from './submissao.result';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { DadosRespostaType } from 'src/shared/types/dados-resposta.type';

export class ArquivoSubmissaoResultDto {
  id: number;
  titulo: string;
  url: string;
  descricao: string;
}

export class AlternativaSubmissaoResultDto {
  id: number;
  descricao: string;
}

export class QuestaoSubmissaoResultDto {
  id: number;
  titulo: string;
  descricao: string;
  pontuacao: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum;
  alternativas: AlternativaSubmissaoResultDto[];
  dadosResposta: DadosRespostaType | null;
  pontuacaoObtida: number | null;
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  textoRevisao: string | null;
}

export class SubmissaoQuestoesResultDto {
  submissao: SubmissaoResultDto;
  questoes: QuestaoSubmissaoResultDto[];
  arquivos: ArquivoSubmissaoResultDto[];

  dataInicioAplicacao: string | null;
  tempoMaximoAvaliacao: number | null;
  descricaoAvaliacao: string | null;
  mostrarPontuacao: boolean | null;
  permitirRevisao: boolean | null;

  tituloAvaliacao: string | null;
  nomeAvaliador: string | null;

  constructor(model: SubmissaoModel) {
    this.submissao = new SubmissaoResultDto(model);
    this.questoes = model.respostas
      .sort((a, b) => a.ordem - b.ordem)
      .map(
        (resposta): QuestaoSubmissaoResultDto => ({
          id: resposta.questao.id,
          titulo: resposta.questao.item.titulo,
          descricao: resposta.questao.descricao,
          pontuacao: resposta.questao.pontuacao,
          dificuldade: resposta.questao.dificuldade,
          tipo: resposta.questao.tipoQuestao,
          alternativas: resposta.questao.alternativas.map((alternativa) => ({
            id: alternativa.id,
            descricao: alternativa.descricao,
          })),
          dadosResposta: resposta.dadosResposta,
          pontuacaoObtida: resposta.pontuacao,
          estadoCorrecao: resposta.estadoCorrecao,
          textoRevisao: resposta.textoRevisao,
        }),
      );
    this.arquivos = model.aplicacao.avaliacao.arquivos
      .filter((arquivo) => arquivo.permitirConsultaPorEstudante)
      .map((arquivo) => ({
        id: arquivo.arquivo.id,
        titulo: arquivo.arquivo.item.titulo,
        url: arquivo.arquivo.url,
        descricao: arquivo.arquivo.descricao,
      }));

    const configGerais =
      model.aplicacao?.avaliacao?.configuracaoAvaliacao?.configuracoesGerais;
    const avaliacaoItem = model.aplicacao?.avaliacao?.item;

    this.dataInicioAplicacao =
      model.aplicacao?.dataInicio?.toISOString() ?? null;
    this.tempoMaximoAvaliacao = configGerais?.tempoMaximo ?? null;
    this.descricaoAvaliacao = model.aplicacao?.avaliacao?.descricao ?? null;
    this.mostrarPontuacao = configGerais?.mostrarPontuacao ?? null;
    this.permitirRevisao = configGerais?.permitirRevisao ?? null;

    this.tituloAvaliacao = avaliacaoItem?.titulo ?? null;
    this.nomeAvaliador = avaliacaoItem?.avaliador?.nome ?? null;
  }
}
