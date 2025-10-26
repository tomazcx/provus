import { ArquivoSubmissaoResultDto } from '../submissao/submissao-questoes.result';
import { SubmissaoResultDto } from '../submissao/submissao.result';
import { QuestaoRevisaoResultDto } from './questao-revisao.result.dto';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';

export class SubmissaoRevisaoResultDto {
  submissao: SubmissaoResultDto;
  questoes: QuestaoRevisaoResultDto[];
  arquivos: ArquivoSubmissaoResultDto[];
  dataInicioAplicacao: string | null;
  tempoMaximoAvaliacao: number | null;
  descricaoAvaliacao: string | null;
  mostrarPontuacao: boolean | null;
  permitirRevisao: boolean | null;
  tituloAvaliacao: string | null;
  nomeAvaliador: string | null;
  quantidadeTentativas: number | null;

  constructor(model: SubmissaoModel) {
    this.submissao = new SubmissaoResultDto(model);
    this.questoes = model.respostas
      .sort((a, b) => a.ordem - b.ordem)
      .map((resposta) => new QuestaoRevisaoResultDto(resposta));

    this.arquivos = (model.aplicacao?.avaliacao?.arquivos ?? [])
      .filter((aa) => aa.permitirConsultaPorEstudante)
      .map((aa) => ({
        id: aa.arquivo.id,
        titulo: aa.arquivo.item.titulo,
        url: aa.arquivo.url,
        descricao: aa.arquivo.descricao,
      }));

    const configGerais =
      model.aplicacao?.avaliacao?.configuracaoAvaliacao?.configuracoesGerais;
    const configSeguranca =
      model.aplicacao?.avaliacao?.configuracaoAvaliacao?.configuracoesSeguranca;
    const avaliacaoItem = model.aplicacao?.avaliacao?.item;
    this.dataInicioAplicacao =
      model.aplicacao?.dataInicio?.toISOString() ?? null;
    this.tempoMaximoAvaliacao = configGerais?.tempoMaximo ?? null;
    this.descricaoAvaliacao = model.aplicacao?.avaliacao?.descricao ?? null;
    this.mostrarPontuacao = configGerais?.mostrarPontuacao ?? null;
    this.permitirRevisao = configGerais?.permitirRevisao ?? null;
    this.tituloAvaliacao = avaliacaoItem?.titulo ?? null;
    this.nomeAvaliador = avaliacaoItem?.avaliador?.nome ?? null;
    this.quantidadeTentativas = configSeguranca?.quantidadeTentativas ?? null;
  }
}
