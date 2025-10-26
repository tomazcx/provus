import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { AvaliacaoDto } from '../avaliacao/avaliacao.dto';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';

export class FindAllAplicacaoDto {
  id: number;
  avaliacao: AvaliacaoDto;
  estado: EstadoAplicacaoEnum;
  codigoAcesso: string;
  dataInicio: string;
  dataFim: string;
  totalSubmissoes: number;
  mediaGeralPercentual: number | null;

  constructor(
    model: AplicacaoModel,
    totalSubmissoes: number,
    mediaGeralPercentual: number | null,
    avaliacaoPath: string,
  ) {
    this.id = model.id;
    this.avaliacao = new AvaliacaoDto(model.avaliacao, avaliacaoPath);
    this.estado = model.estado;
    this.codigoAcesso = model.codigoAcesso;
    this.dataInicio = model.dataInicio ? model.dataInicio.toISOString() : '';
    this.dataFim = model.dataFim ? model.dataFim.toISOString() : '';
    this.totalSubmissoes = totalSubmissoes;
    this.mediaGeralPercentual = mediaGeralPercentual;
  }
}

export class FindAllAplicacaoDtoFactory {
  static async create(
    model: AplicacaoModel,
    stats: { totalSubmissoes: number; mediaGeralPercentual: number | null },
    itemRepo: ItemSistemaArquivosRepository,
  ): Promise<FindAllAplicacaoDto> {
    const avaliacaoPath = await itemRepo.findPathById(model.avaliacao.id);
    return new FindAllAplicacaoDto(
      model,
      stats.totalSubmissoes,
      stats.mediaGeralPercentual,
      avaliacaoPath ?? '',
    );
  }
}
