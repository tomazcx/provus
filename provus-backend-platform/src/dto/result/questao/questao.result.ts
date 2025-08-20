import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';
import { AlternativaResultDto } from '../alternativa/alternativa.result';

export class QuestaoResultDto {
  id: number;
  titulo: string;
  paiId?: number;
  path: string;
  criadoEm: string;
  atualizadoEm: string;
  descricao?: string;
  dificuldade: DificuldadeQuestaoEnum;
  exemploRespostaIa: string;
  pontuacao: number;
  isModelo: boolean;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas: AlternativaResultDto[];
}
