import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { SubmissaoResultDto } from './submissao.result';
import { AvaliadorQuestaoDetalheDto } from './avaliador-questao-detalhe.dto';

class EstudanteSubmissaoDetalheDto {
  nome: string;
  email: string;
}

export class AvaliadorSubmissaoDetalheDto {
  submissao: SubmissaoResultDto;
  estudante: EstudanteSubmissaoDetalheDto;
  questoes: AvaliadorQuestaoDetalheDto[];
  tituloAvaliacao: string | null;
  pontuacaoTotalAvaliacao: number;

  constructor(model: SubmissaoModel, pontuacaoTotalAvaliacao: number) {
    this.submissao = new SubmissaoResultDto(model);
    this.estudante = {
      nome: model.estudante?.nome ?? 'Aluno Anônimo',
      email: model.estudante?.email ?? '',
    };
    this.questoes = (model.respostas ?? [])
      .sort((a, b) => a.ordem - b.ordem)
      .map((resposta) => new AvaliadorQuestaoDetalheDto(resposta));
    this.tituloAvaliacao = model.aplicacao?.avaliacao?.item?.titulo ?? null;
    this.pontuacaoTotalAvaliacao = pontuacaoTotalAvaliacao;
  }
}
