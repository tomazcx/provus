import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { CreateAlternativaDto } from '../alternativa/create-alternativa.dto';

export interface CreateQuestaoDto {
  titulo: string;
  paiId?: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  isModelo: boolean;
  descricao?: string;
  exemploRespostaIa?: string;
  textoRevisao?: string;
  alternativas?: readonly CreateAlternativaDto[];
}
