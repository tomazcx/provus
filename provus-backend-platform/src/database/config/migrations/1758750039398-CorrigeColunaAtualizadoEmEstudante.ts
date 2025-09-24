import { MigrationInterface, QueryRunner } from 'typeorm';

export class CorrigeColunaAtualizadoEmEstudante1758750039398
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estudante" ALTER COLUMN "atualizado_em" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissao" ALTER COLUMN "atualizado_em" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissao" ALTER COLUMN "finalizado_em" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "estudante"
            ALTER COLUMN "atualizado_em"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submissao"
            ALTER COLUMN "atualizado_em"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submissao"
            ALTER COLUMN "finalizado_em"
            SET NOT NULL
        `);
  }
}
