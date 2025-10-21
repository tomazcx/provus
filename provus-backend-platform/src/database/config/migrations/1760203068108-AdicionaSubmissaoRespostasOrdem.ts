import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionaSubmissaoRespostasOrdem1760203068108
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submissao_respostas" ADD "ordem" integer NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "submissao_respostas" ADD CONSTRAINT "UQ_submissao_respostas_submissao_id_ordem" UNIQUE ("submissao_id", "ordem")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submissao_respostas" DROP CONSTRAINT "UQ_submissao_respostas_submissao_id_ordem"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissao_respostas" DROP COLUMN "ordem"`,
    );
  }
}
