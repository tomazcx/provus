import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoverMultiplosEnvios1764429643313 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'configuracoes_gerais',
      'permitir_multiplos_envios',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'configuracoes_gerais',
      new TableColumn({
        name: 'permitir_multiplos_envios',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );
  }
}
