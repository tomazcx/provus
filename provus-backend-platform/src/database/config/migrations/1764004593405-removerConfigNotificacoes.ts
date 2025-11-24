import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoverConfigNotificacoes1764004593405
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('configuracoes_seguranca', 'duracao_alertas');
    await queryRunner.dropColumn(
      'configuracoes_seguranca',
      'permitir_fechar_alertas',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'duracao_alertas',
        type: 'int',
        default: 5,
      }),
    );
    await queryRunner.addColumn(
      'configuracoes_seguranca',
      new TableColumn({
        name: 'permitir_fechar_alertas',
        type: 'boolean',
        default: true,
      }),
    );
  }
}
