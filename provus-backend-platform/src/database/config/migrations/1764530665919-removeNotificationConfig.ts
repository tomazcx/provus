import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNotificationConfig1764530665919
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('configuracao_notificacao');
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."configuracao_notificacao_tipo_notificacao_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."configuracao_notificacao_tipo_notificacao_enum" AS ENUM('Email', 'Notificação Push')`,
    );
    await queryRunner.query(
      `CREATE TABLE "configuracao_notificacao" ("tipo_notificacao" "public"."configuracao_notificacao_tipo_notificacao_enum" NOT NULL, "configuracoes_seguranca_id" integer NOT NULL, CONSTRAINT "PK_notificacao" PRIMARY KEY ("tipo_notificacao", "configuracoes_seguranca_id"))`,
    );
  }
}
