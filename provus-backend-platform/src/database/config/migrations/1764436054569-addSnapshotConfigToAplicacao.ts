import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddSnapshotConfigToAplicacao1764436054569
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'aplicacao',
      new TableColumn({
        name: 'configuracao_aplicacao_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'aplicacao',
      new TableForeignKey({
        columnNames: ['configuracao_aplicacao_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'configuracao_avaliacao',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('aplicacao');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('configuracao_aplicacao_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('aplicacao', foreignKey);
    }
    await queryRunner.dropColumn('aplicacao', 'configuracao_aplicacao_id');
  }
}
