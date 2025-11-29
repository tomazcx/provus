import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoverAcessoSimultaneo1764430897178
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'configuracoes_seguranca',
      'quantidade_acessos_simultaneos',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'quantidade_acessos_simultaneos',
        type: 'int',
        isNullable: false,
        default: 1,
      }),
    );
  }
}
