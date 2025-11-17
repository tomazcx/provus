import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddPunicaoConfigFKToRegistroPunicao1763308095876
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'registro_punicao_por_ocorrencia',
      new TableColumn({
        name: 'punicao_config_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'registro_punicao_por_ocorrencia',
      new TableForeignKey({
        columnNames: ['punicao_config_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'punicao_por_ocorrencia',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('registro_punicao_por_ocorrencia');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('punicao_config_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey(
        'registro_punicao_por_ocorrencia',
        foreignKey,
      );
    }

    await queryRunner.dropColumn(
      'registro_punicao_por_ocorrencia',
      'punicao_config_id',
    );
  }
}
