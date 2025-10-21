import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import { SubmissaoResultDto } from './submissao.result';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';

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
  dadosResposta: any;
}

export class SubmissaoQuestoesResultDto {
  submissao: SubmissaoResultDto;
  questoes: QuestaoSubmissaoResultDto[];
  arquivos: ArquivoSubmissaoResultDto[];

  constructor(model: SubmissaoModel) {
    this.submissao = new SubmissaoResultDto(model);
    this.questoes = model.respostas
      .sort((a, b) => a.ordem - b.ordem)
      .map((questao) => ({
        id: questao.questao.id,
        titulo: questao.questao.item.titulo,
        descricao: questao.questao.descricao,
        pontuacao: questao.questao.pontuacao,
        dificuldade: questao.questao.dificuldade,
        tipo: questao.questao.tipoQuestao,
        alternativas: questao.questao.alternativas.map((alternativa) => ({
          id: alternativa.id,
          descricao: alternativa.descricao,
        })),
        dadosResposta: questao.dadosResposta,
      }));
    this.arquivos = model.aplicacao.avaliacao.arquivos
      .filter((arquivo) => arquivo.permitirConsultaPorEstudante)
      .map((arquivo) => ({
        id: arquivo.arquivo.id,
        titulo: arquivo.arquivo.item.titulo,
        url: arquivo.arquivo.url,
        descricao: arquivo.arquivo.descricao,
      }));
  }
}
