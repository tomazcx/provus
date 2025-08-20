import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItemSistemaArquivosModel } from '../config/models/item-sistema-arquivos.model';

@Injectable()
export class ItemSistemaArquivosRepository extends Repository<ItemSistemaArquivosModel> {
  constructor(private dataSource: DataSource) {
    super(ItemSistemaArquivosModel, dataSource.createEntityManager());
  }

  async findPathById(id: number): Promise<string | null> {
    const query = `
      WITH RECURSIVE parent_path AS (
        SELECT
          id,
          pai_id,
          1 AS depth
        FROM item_sistema_arquivos
        WHERE id = (SELECT pai_id FROM item_sistema_arquivos WHERE id = $1)

        UNION ALL

        SELECT
          i.id,
          i.pai_id,
          p.depth + 1
        FROM item_sistema_arquivos i
        JOIN parent_path p ON i.id = p.pai_id
      )
      SELECT
        COALESCE('/' || STRING_AGG(isa.titulo, '/' ORDER BY p.depth DESC), '') AS path
      FROM parent_path p
      JOIN item_sistema_arquivos isa ON p.id = isa.id;
    `;
    const result: { path: string }[] = await this.query(query, [id]);

    return result[0].path;
  }
}
