import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import { ConfiguracaoAvaliacaoDto } from '../configuracao-avaliacao/configuracao-avaliacao.dto';

export class AvaliacaoDto {
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  path: string;
  configuracaoAvaliacao: ConfiguracaoAvaliacaoDto;
  criadoEm: string;
  atualizadoEm: string;

  constructor(model: AvaliacaoModel, path: string) {
    this.id = model.id;
    this.titulo = model.item.titulo;
    this.descricao = model.descricao;
    this.isModelo = model.isModelo;
    this.path = path;
    this.configuracaoAvaliacao = new ConfiguracaoAvaliacaoDto(
      model.configuracaoAvaliacao,
    );
  }
}
