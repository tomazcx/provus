import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';

export class AddCorrectionFieldsToSubmissaoRespostasTable1760836696347
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."submissao_respostas_estado_correcao_enum" AS ENUM(
                '${EstadoQuestaoCorrigida.CORRETA}',
                '${EstadoQuestaoCorrigida.INCORRETA}',
                '${EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA}',
                '${EstadoQuestaoCorrigida.NAO_RESPONDIDA}',
                '${EstadoQuestaoCorrigida.PENDENTE_CORRECAO_MANUAL}'
            );
        `);
    await queryRunner.addColumn(
      'submissao_respostas',
      new TableColumn({
        name: 'estado_correcao',
        type: 'enum',
        enumName: 'submissao_respostas_estado_correcao_enum',
        isNullable: true,
        default: `'${EstadoQuestaoCorrigida.NAO_RESPONDIDA}'`,
      }),
    );

    await queryRunner.addColumn(
      'submissao_respostas',
      new TableColumn({
        name: 'texto_revisao',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'submissao_respostas',
      'pontuacao',
      new TableColumn({
        name: 'pontuacao',
        type: 'numeric(5,2)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('submissao_respostas', 'texto_revisao');
    await queryRunner.dropColumn('submissao_respostas', 'estado_correcao');
    await queryRunner.query(
      `DROP TYPE "public"."submissao_respostas_estado_correcao_enum";`,
    );
  }
}
