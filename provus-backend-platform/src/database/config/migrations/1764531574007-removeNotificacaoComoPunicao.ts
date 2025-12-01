import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNotificacaoComoPunicao1764531574007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "punicao_por_ocorrencia" 
      WHERE "tipo_penalidade"::text IN ('Notificar professor', 'Alertar estudante')
    `);

    await queryRunner.query(`
      DELETE FROM "registro_punicao_por_ocorrencia" 
      WHERE "tipo_penalidade"::text IN ('Notificar professor', 'Alertar estudante')
    `);

    await queryRunner.query(
      `ALTER TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" RENAME TO "punicao_por_ocorrencia_tipo_penalidade_enum_old"`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" AS ENUM('Reduzir pontos do resultado', 'Reduzir tempo de avaliação', 'Encerrar avaliação')`,
    );

    await queryRunner.query(`
      ALTER TABLE "punicao_por_ocorrencia" 
      ALTER COLUMN "tipo_penalidade" TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" 
      USING "tipo_penalidade"::text::"public"."punicao_por_ocorrencia_tipo_penalidade_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "registro_punicao_por_ocorrencia" 
      ALTER COLUMN "tipo_penalidade" TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" 
      USING "tipo_penalidade"::text::"public"."punicao_por_ocorrencia_tipo_penalidade_enum"
    `);

    await queryRunner.query(
      `DROP TYPE "punicao_por_ocorrencia_tipo_penalidade_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" RENAME TO "punicao_por_ocorrencia_tipo_penalidade_enum_new"`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" AS ENUM('Notificar professor', 'Alertar estudante', 'Reduzir pontos do resultado', 'Reduzir tempo de avaliação', 'Encerrar avaliação')`,
    );

    await queryRunner.query(`
      ALTER TABLE "punicao_por_ocorrencia" 
      ALTER COLUMN "tipo_penalidade" TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" 
      USING "tipo_penalidade"::text::"public"."punicao_por_ocorrencia_tipo_penalidade_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "registro_punicao_por_ocorrencia" 
      ALTER COLUMN "tipo_penalidade" TYPE "public"."punicao_por_ocorrencia_tipo_penalidade_enum" 
      USING "tipo_penalidade"::text::"public"."punicao_por_ocorrencia_tipo_penalidade_enum"
    `);

    await queryRunner.query(
      `DROP TYPE "punicao_por_ocorrencia_tipo_penalidade_enum_new"`,
    );
  }
}
