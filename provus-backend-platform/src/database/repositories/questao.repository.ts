import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuestaoModel } from '../config/models/questao.model';
import { AlternativaModel } from '../config/models/alternativa.model';
import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';

export interface RawQuestaoWithPath {
  id: number;
  titulo: string;
  criado_em: Date;
  atualizado_em: Date;
  path: string;
  dificuldade: DificuldadeQuestaoEnum;
  descricao: string;
  exemploRespostaIa: string;
  isModelo: boolean;
  tipo_questao: TipoQuestaoEnum;
  textoRevisao: string;
  pontuacao: number;
}

interface RawQuestaoResult {
  id: number;
  titulo: string;
  criado_em: Date;
  atualizado_em: Date;
  path: string;
  dificuldade: DificuldadeQuestaoEnum;
  descricao: string;
  exemploRespostaIa: string;
  isModelo: boolean;
  tipo_questao: TipoQuestaoEnum;
  textoRevisao: string;
  pontuacao: number;
}

@Injectable()
export class QuestaoRepository extends Repository<QuestaoModel> {
  constructor(private dataSource: DataSource) {
    super(QuestaoModel, dataSource.createEntityManager());
  }

  async findByIdComPath(
    id: number,
  ): Promise<(RawQuestaoResult & { alternativas: AlternativaModel[] }) | null> {
    const query = `
      WITH RECURSIVE parent_path AS (
        -- Ponto de Partida (Anchor): Começa no PAI DIRETO do item que queremos.
        -- Se não houver pai, esta parte não retorna nada.
        SELECT
          pai_id,
          CAST(titulo AS TEXT) as path
        FROM item_sistema_arquivos
        WHERE id = (SELECT pai_id FROM item_sistema_arquivos WHERE id = $1)

        UNION ALL

        -- Parte Recursiva: Sobe na árvore a partir do pai encontrado.
        SELECT
          i.pai_id,
          i.titulo || '/' || p.path
        FROM item_sistema_arquivos i
        JOIN parent_path p ON i.id = p.pai_id
      )
      SELECT
        q.*,
        i.titulo,
        i.criado_em,
        i.atualizado_em,
        -- Pega o caminho mais longo (o completo) da nossa CTE.
        -- Se a CTE estiver vazia (sem pais), COALESCE retorna uma string vazia ''.
        COALESCE((SELECT path FROM parent_path ORDER BY LENGTH(path) DESC LIMIT 1), '') as path
      FROM questao q
      JOIN item_sistema_arquivos i ON q.id = i.id
      WHERE q.id = $1;
    `;

    const results = await Promise.all([
      this.query(query, [id]),
      this.manager
        .getRepository(AlternativaModel)
        .find({ where: { questao: { id } } }),
    ]);

    const questaoRawResult = results[0] as RawQuestaoResult[];
    const alternativas = results[1];

    if (!questaoRawResult || questaoRawResult.length === 0) {
      return null;
    }

    const rawQuestao = questaoRawResult[0];

    return { ...rawQuestao, alternativas };
  }
}
