import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateArquivosAvaliacoesTable1757275386753
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'arquivos_avaliacoes',
        columns: [
          {
            name: 'avaliacao_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'arquivo_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'permitir_consulta_por_estudante',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['avaliacao_id'],
            referencedTableName: 'avaliacao',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['arquivo_id'],
            referencedTableName: 'arquivo',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_arquivos_avaliacoes_avaliacao_id',
            columnNames: ['avaliacao_id'],
          },
          {
            name: 'IDX_arquivos_avaliacoes_arquivo_id',
            columnNames: ['arquivo_id'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('arquivos_avaliacoes');
  }
}
