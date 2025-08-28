import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQuestaoColumnsCase1756347434927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questao" RENAME COLUMN "exemploRespostaIa" TO "exemplo_resposta_ia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questao" RENAME COLUMN "isModelo" TO "is_modelo"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questao" RENAME COLUMN "exemplo_resposta_ia" TO "exemploRespostaIa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questao" RENAME COLUMN "is_modelo" TO "isModelo"`,
    );
  }
}
