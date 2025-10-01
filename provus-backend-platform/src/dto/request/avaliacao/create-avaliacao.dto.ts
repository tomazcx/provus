import { CreateConfiguracoesAvaliacaoDto } from '../configuracoes-avaliacao/create-configuracoes-avaliacao.dto';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

class CreateAlternativaDto {
  descricao: string;
  isCorreto: boolean;
}

export class CreateQuestaoAvaliacaoDto {
  questaoId?: number;
  ordem: number;
  pontuacao: number;

  titulo?: string;
  descricao?: string;
  tipoQuestao?: TipoQuestaoEnum;
  dificuldade?: DificuldadeQuestaoEnum;
  alternativas?: CreateAlternativaDto[];
  exemploRespostaIa?: string;
  textoRevisao?: string;
}

export class CreateArquivoAvaliacaoDto {
  arquivoId: number;
  permitirConsultaPorEstudante: boolean;
}

export class CreateAvaliacaoDto {
  titulo: string;
  descricao: string;
  isModelo: boolean;
  paiId?: number;
  configuracoesAvaliacao: CreateConfiguracoesAvaliacaoDto;
  questoes: CreateQuestaoAvaliacaoDto[];
  arquivos: CreateArquivoAvaliacaoDto[];
}
