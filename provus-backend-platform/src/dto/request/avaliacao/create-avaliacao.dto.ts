import { CreateConfiguracoesAvaliacaoDto } from '../configuracoes-avaliacao/create-configuracoes-avaliacao.dto';

export class CreateAvaliacaoDto {
  titulo: string;
  descricao: string;
  isModelo: boolean;
  paiId?: number;
  configuracoesAvaliacao: CreateConfiguracoesAvaliacaoDto;
}
