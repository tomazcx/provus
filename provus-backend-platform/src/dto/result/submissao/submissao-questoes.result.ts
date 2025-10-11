import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import { SubmissaoResultDto } from './submissao.result';
import { AlternativaResultDto } from '../alternativa/alternativa.result';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

export class ArquivoSubmissaoResultDto {
  id: number;
  titulo: string;
  url: string;
  descricao: string;
}

export class QuestaoSubmissaoResultDto {
  id: number;
  titulo: string;
  descricao: string;
  pontuacao: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum;
  alternativas: AlternativaResultDto[];
}

export class SubmissaoQuestoesResultDto {
  submissao: SubmissaoResultDto;
  questoes: QuestaoSubmissaoResultDto[];
  arquivos: ArquivoSubmissaoResultDto[];
}
