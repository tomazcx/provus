import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

export class CreateAiQuestaoDto {
  assunto: string;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  quantidade: number;
}
