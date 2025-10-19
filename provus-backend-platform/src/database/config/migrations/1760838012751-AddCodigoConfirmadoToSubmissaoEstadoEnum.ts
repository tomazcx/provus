import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodigoConfirmadoToSubmissaoEstadoEnum1760838012751
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."submissao_estado_enum" ADD VALUE 'Código confirmado'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."submissao_estado_enum" DROP VALUE 'Código confirmado'`,
    );
  }
}
