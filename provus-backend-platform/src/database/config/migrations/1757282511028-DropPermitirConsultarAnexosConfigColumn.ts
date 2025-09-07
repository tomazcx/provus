import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPermitirConsultarAnexosConfigColumn1757282511028
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configuracoes_gerais" DROP COLUMN "permitir_consultar_anexos"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configuracoes_gerais" ADD COLUMN "permitir_consultar_anexos" boolean NOT NULL DEFAULT false`,
    );
  }
}
