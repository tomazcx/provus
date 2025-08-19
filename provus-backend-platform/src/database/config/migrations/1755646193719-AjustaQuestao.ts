import { MigrationInterface, QueryRunner } from "typeorm";

export class AjustaQuestao1755646193719 implements MigrationInterface {
    name = 'AjustaQuestao1755646193719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questao" DROP COLUMN "pontuacao"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questao" ADD "pontuacao" integer NOT NULL`);
    }

}
