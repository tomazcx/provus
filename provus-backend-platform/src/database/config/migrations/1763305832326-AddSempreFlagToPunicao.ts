import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSempreFlagToPunicao1763305832326 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "punicao_por_ocorrencia"
        ADD COLUMN "sempre" BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
        ALTER TABLE "punicao_por_ocorrencia"
        ADD COLUMN "quantidade_aplicacoes" INTEGER
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "punicao_por_ocorrencia"
        DROP COLUMN "sempre"
    `);

    await queryRunner.query(`
        ALTER TABLE "punicao_por_ocorrencia"
        DROP COLUMN "quantidade_aplicacoes"
    `);
  }
}
