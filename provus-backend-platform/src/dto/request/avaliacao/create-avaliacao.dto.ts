import { CreateConfiguracoesAvaliacaoDto } from '../configuracoes-avaliacao/create-configuracoes-avaliacao.dto';

export class CreateQuestaoAvaliacaoDto {
  questaoId: number;
  ordem: number;
  pontuacao: number;
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
