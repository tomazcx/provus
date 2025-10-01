import type { ItemEntity } from "./Item.entity";
import type TipoItemEnum from "~/enums/TipoItemEnum";
import type { QuestaoEntity } from "./Questao.entity";
import type { ArquivoEntity } from "./Arquivo.entity";
import type { ConfiguracoesEntity } from "./Configuracoes.entity";

export interface ArquivoAvaliacaoEntity {
  arquivo: ArquivoEntity;
  permitirConsultaPorEstudante: boolean;
}

export interface AvaliacaoEntity extends ItemEntity {
  tipo: TipoItemEnum.AVALIACAO;
  descricao: string;
  isModelo: boolean;
  pontuacao: number;
  arquivos: ArquivoAvaliacaoEntity[];
  questoes: QuestaoEntity[];
  configuracao: ConfiguracoesEntity;
}
