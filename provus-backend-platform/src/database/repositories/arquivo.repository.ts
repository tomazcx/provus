import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { ArquivoModel } from '../config/models/arquivo.model';
import { CreateArquivoDto } from 'src/dto/request/arquivo/create-arquivo.dto';

@Injectable()
export class ArquivoRepository extends Repository<ArquivoModel> {
  constructor(private dataSource: DataSource) {
    super(ArquivoModel, dataSource.createEntityManager());
  }

  async createArquivo(
    dto: CreateArquivoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    const query = `
      WITH novo_arquivo AS (
        INSERT INTO "item_sistema_arquivos" ("titulo", "tipo", "avaliador_id", "pai_id")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      )
      INSERT INTO "arquivo" (
        "id", "url", "descricao", "tamanho_em_bytes"
      )
      SELECT
        id, $5, $6, $7
      FROM
        novo_arquivo
      RETURNING id;
    `;

    const params = [
      dto.titulo,
      TipoItemEnum.ARQUIVO,
      avaliador.id,
      dto.paiId || null,
      dto.url,
      dto.descricao,
      dto.tamanhoEmBytes,
    ];

    return this.dataSource.transaction(async (manager) => {
      const result: { id: number }[] = await manager.query(query, params);
      const newArquivoId = result[0].id;

      return newArquivoId;
    });
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<ArquivoModel[]> {
    return this.find({
      where: {
        item: {
          tipo: TipoItemEnum.ARQUIVO,
          avaliador: { id: avaliadorId },
          pai: pastaId === null ? IsNull() : { id: pastaId },
        },
      },
      relations: ['item'],
    });
  }
}
