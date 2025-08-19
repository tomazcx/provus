import TipoItemEnum from 'src/domain/enums/tipo-item.enum';
import type { Aplicacao } from './aplicacao.entity';
import type { ConfiguracaoAvaliacao } from './configuracao-avaliacao.entity';
import { QuestoesAvaliacoes } from './questoes-avaliacoes.entity';
import { ItemSistemaArquivos } from './item-sistema-arquivos.entity';

export class Avaliacao extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.AVALIACAO;

  descricao: string;
  isModelo: boolean;
  questoesAvaliacoes: QuestoesAvaliacoes[];
  aplicacoes: Aplicacao[];
  configuracaoAvaliacao: ConfiguracaoAvaliacao;
}
