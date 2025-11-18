import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ItemSistemaArquivosModel } from '../config/models/item-sistema-arquivos.model';
import { TipoItemEnum } from 'src/enums/tipo-item.enum';

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

  async findByParent(
    paiId: number | null,
    avaliadorId: number,
  ): Promise<ItemSistemaArquivosModel[]> {
    const queryBuilder = this.createQueryBuilder('item').where(
      'item.avaliador_id = :avaliadorId',
      { avaliadorId },
    );

    queryBuilder
      .leftJoinAndSelect('item.questao', 'questao')
      .leftJoinAndSelect('questao.alternativas', 'alternativas')
      .leftJoinAndSelect('item.arquivo', 'arquivo')
      .leftJoinAndSelect('item.avaliacao', 'avaliacao')
      .leftJoinAndSelect('avaliacao.questoes', 'questoesAvaliacoes')
      .leftJoinAndSelect('questoesAvaliacoes.questao', 'questaoDaAvaliacao')
      .leftJoinAndSelect('questaoDaAvaliacao.item', 'itemDaQuestaoDaAvaliacao')
      .leftJoinAndSelect(
        'itemDaQuestaoDaAvaliacao.questao',
        'questaoDaQuestaoDaAvaliacao',
      )
      .leftJoinAndSelect(
        'questaoDaQuestaoDaAvaliacao.alternativas',
        'alternativasDaQuestaoDaAvaliacao',
      )
      .leftJoinAndSelect('avaliacao.arquivos', 'arquivosAvaliacoes')
      .leftJoinAndSelect('arquivosAvaliacoes.arquivo', 'arquivoDaAvaliacao')
      .leftJoinAndSelect('arquivoDaAvaliacao.item', 'itemDoArquivoDaAvaliacao')
      .leftJoinAndSelect(
        'itemDoArquivoDaAvaliacao.arquivo',
        'detalhesDoArquivoAnexado',
      )
      .leftJoinAndSelect(
        'avaliacao.configuracaoAvaliacao',
        'configuracaoAvaliacao',
      )
      .leftJoinAndSelect(
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracoesGerais',
      )
      .leftJoinAndSelect(
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracoesSeguranca',
      );

    if (paiId === null) {
      queryBuilder.andWhere('item.pai_id IS NULL');
    } else {
      queryBuilder.andWhere('item.pai_id = :paiId', { paiId });
    }

    return queryBuilder
      .orderBy('item.tipo', 'ASC')
      .addOrderBy('item.titulo', 'ASC')
      .getMany();
  }

  async findAllQuestionIdsInFolders(
    folderIds: number[],
    avaliadorId: number,
  ): Promise<number[]> {
    if (folderIds.length === 0) {
      return [];
    }

    const query = `
      WITH RECURSIVE subfolders AS (
          SELECT id, tipo FROM item_sistema_arquivos WHERE id = ANY($1) AND avaliador_id = $2
          UNION ALL
          SELECT i.id, i.tipo FROM item_sistema_arquivos i
          INNER JOIN subfolders sf ON i.pai_id = sf.id
          WHERE i.avaliador_id = $2
      )
      SELECT id FROM subfolders WHERE tipo = '${TipoItemEnum.QUESTAO}';
    `;

    const results: { id: number }[] = await this.query(query, [
      folderIds,
      avaliadorId,
    ]);
    return results.map((r) => r.id);
  }

  async findAllFileIdsInFolders(
    folderIds: number[],
    avaliadorId: number,
  ): Promise<number[]> {
    if (folderIds.length === 0) {
      return [];
    }

    const query = `
      WITH RECURSIVE subfolders AS (
          SELECT id, tipo FROM item_sistema_arquivos WHERE id = ANY($1) AND avaliador_id = $2
          UNION ALL
          SELECT i.id, i.tipo FROM item_sistema_arquivos i
          INNER JOIN subfolders sf ON i.pai_id = sf.id
          WHERE i.avaliador_id = $2
      )
      SELECT id FROM subfolders WHERE tipo = '${TipoItemEnum.ARQUIVO}';
    `;

    const results: { id: number }[] = await this.query(query, [
      folderIds,
      avaliadorId,
    ]);
    return results.map((r) => r.id);
  }
}
