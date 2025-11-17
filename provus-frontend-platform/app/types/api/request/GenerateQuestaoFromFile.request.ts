import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

export interface GenerateQuestaoFromFileRequestDto {
  arquivoIds?: number[];
  assunto?: string;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  quantidade: number;
}
