import { MigrationInterface, QueryRunner } from 'typeorm';

export class AjustaAlternativa1757729050028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "alternativa" DROP COLUMN "titulo"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alternativa" ADD COLUMN "titulo" VARCHAR NOT NULL DEFAULT ''`,
    );
  }
}
