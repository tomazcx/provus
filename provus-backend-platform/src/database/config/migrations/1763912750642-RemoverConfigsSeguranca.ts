import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class RemoverConfigsSeguranca1763912750642
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'configuracoes_seguranca',
      'proibir_print_screen',
    );
    await queryRunner.dropColumn('configuracoes_seguranca', 'proibir_devtools');
    await queryRunner.dropColumn(
      'configuracoes_seguranca',
      'ativar_controle_ip',
    );
    await queryRunner.dropTable('ips_permitidos');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'proibir_print_screen',
        type: 'boolean',
        default: false,
      }),
    );
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'proibir_devtools',
        type: 'boolean',
        default: false,
      }),
    );
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'ativar_controle_ip',
        type: 'boolean',
        default: false,
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'ips_permitidos',
        columns: [
          {
            name: 'configuracoes_seguranca_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['configuracoes_seguranca_id'],
            referencedTableName: 'configuracoes_seguranca',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }
}
