import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAvaliadorRecuperarSenhaTable1754235737512
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'avaliador_recuperar_senha',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar(50)',
          },
          {
            name: 'hash',
            type: 'varchar(36)',
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('avaliador_recuperar_senha');
  }
}
