import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import { QuestaoModel } from '../config/models/questao.model';
import { AlternativaModel } from '../config/models/alternativa.model';
import { CreateQuestaoRequest } from 'src/http/controllers/backoffice/questao/create-questao/request';

import TipoItemEnum from 'src/enums/tipo-item.enum';
import { AvaliadorModel } from '../config/models/avaliador.model';

@Injectable()
export class QuestaoRepository extends Repository<QuestaoModel> {
  constructor(private dataSource: DataSource) {
    super(QuestaoModel, dataSource.createEntityManager());
  }

  async createQuestao(
    dto: CreateQuestaoRequest,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    const query = `
      WITH novo_item AS (
        INSERT INTO "item_sistema_arquivos" ("titulo", "tipo", "avaliador_id", "pai_id")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      )
      INSERT INTO "questao" (
        "id", "dificuldade", "descricao", "exemplo_resposta_ia", "is_modelo", "tipo_questao", "texto_revisao", "pontuacao"
      )
      SELECT
        id, $5, $6, $7, $8, $9, $10, $11
      FROM
        novo_item
      RETURNING id;
    `;

    const params = [
      dto.titulo,
      TipoItemEnum.QUESTAO,
      avaliador.id,
      dto.paiId || null,
      dto.dificuldade,
      dto.descricao,
      dto.exemploRespostaIa,
      dto.isModelo,
      dto.tipoQuestao,
      dto.textoRevisao,
      dto.pontuacao || 0,
    ];

    return this.dataSource.transaction(async (manager) => {
      const result: { id: number }[] = await manager.query(query, params);
      const newQuestaoId = result[0].id;

      if (dto.alternativas && dto.alternativas.length > 0) {
        const alternativaRepo = manager.getRepository(AlternativaModel);
        const alternativas = dto.alternativas.map((altDto) =>
          alternativaRepo.create({
            ...altDto,
            questao: { id: newQuestaoId } as QuestaoModel,
          }),
        );
        await alternativaRepo.save(alternativas);
      }

      return newQuestaoId;
    });
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<QuestaoModel[]> {
    return this.find({
      where: {
        item: {
          tipo: TipoItemEnum.QUESTAO,
          avaliador: { id: avaliadorId },
          pai: pastaId === null ? IsNull() : { id: pastaId },
        },
      },
      relations: ['alternativas', 'item'],
    });
  }
}
