import { Column, MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAvaliadorTable1747772676249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'avaliador',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nome',
            type: 'varchar(48)',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar(50)',
            isNullable: false,
          },
          {
            name: 'senha',
            type: 'varchar(100)',
            isNullable: false,
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('avaliador');
  }
}
