import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAvaliadorConfirmarEmailTable1754854536781
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'avaliador_confirmar_email',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'avaliador_id',
            type: 'int',
          },
          {
            name: 'hash',
            type: 'varchar(36)',
          },
          {
            name: 'is_confirmado',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expira_em',
            type: 'timestamp',
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
