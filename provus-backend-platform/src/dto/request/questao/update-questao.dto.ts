import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { UpdateAlternativaDto } from '../alternativa/update-alternativa.dto';

export interface UpdateQuestaoDto {
  id: number;
  titulo: string;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  descricao?: string;
  exemploRespostaIa?: string;
  textoRevisao?: string;
  alternativas?: readonly UpdateAlternativaDto[];
}
