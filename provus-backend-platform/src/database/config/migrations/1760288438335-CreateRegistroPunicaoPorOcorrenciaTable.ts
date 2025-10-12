import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegistroPunicaoPorOcorrenciaTable1760288438335
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE registro_punicao_por_ocorrencia (
                id SERIAL PRIMARY KEY,
                tipo_infracao public.punicao_por_ocorrencia_tipo_infracao_enum,
                quantidade_ocorrencias INT,
                tipo_penalidade public.punicao_por_ocorrencia_tipo_penalidade_enum,
                pontuacao_perdida INT,
                tempo_reduzido INT,
                submissao_id INT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (submissao_id) REFERENCES submissao(id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE registro_punicao_por_ocorrencia;
        `);
  }
}
