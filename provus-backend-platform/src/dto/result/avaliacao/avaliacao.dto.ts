import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import { ConfiguracaoAvaliacaoDto } from '../configuracao-avaliacao/configuracao-avaliacao.dto';
import { QuestaoResultDto } from '../questao/questao.result';
import { ArquivoDto } from '../arquivo/arquivo.dto';

class ArquivoAvaliacaoDto {
  arquivo: ArquivoDto;
  permitirConsultaPorEstudante: boolean;
}

export class AvaliacaoDto {
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  path: string;
  configuracaoAvaliacao: ConfiguracaoAvaliacaoDto;
  questoes: QuestaoResultDto[];
  arquivos: ArquivoAvaliacaoDto[];
  criadoEm: string;
  atualizadoEm: string;

  constructor(model: AvaliacaoModel, path: string) {
    this.id = model.id;
    this.titulo = model.item.titulo;
    this.descricao = model.descricao;
    this.isModelo = model.isModelo;
    this.path = path;
    this.questoes = model.questoes.map(
      (questao) => new QuestaoResultDto(questao.questao),
    );
    this.arquivos = model.arquivos.map((arquivo) => ({
      arquivo: new ArquivoDto(arquivo.arquivo),
      permitirConsultaPorEstudante: arquivo.permitirConsultaPorEstudante,
    }));
    this.configuracaoAvaliacao = new ConfiguracaoAvaliacaoDto(
      model.configuracaoAvaliacao,
    );
    this.criadoEm = model.item.criadoEm.toISOString();
    this.atualizadoEm = model.item.atualizadoEm.toISOString();
  }
}
