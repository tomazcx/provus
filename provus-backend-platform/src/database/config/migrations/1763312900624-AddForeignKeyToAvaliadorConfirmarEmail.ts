import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeyToAvaliadorConfirmarEmail1763312900624
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE avaliador_confirmar_email
            ADD CONSTRAINT fk_avaliador_confirmar_email
            FOREIGN KEY (avaliador_id)
            REFERENCES avaliador(id)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE avaliador_confirmar_email
            DROP CONSTRAINT fk_avaliador_confirmar_email
        `);
  }
}
