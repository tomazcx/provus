import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPausedAtToAplicacao1761004484202 implements MigrationInterface {
  readonly tableName = 'aplicacao';
  readonly columnName = 'paused_at';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: this.columnName,
        type: 'timestamp with time zone',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, this.columnName);
  }
}
