import { TipoItemEnum } from 'src/domain/enums/tipo-item.enum';
import type { Aplicacao } from '../aplicacao';
import type { ConfiguracaoAvaliacao } from '../configuracao-avaliacao';
import { QuestoesAvaliacoes } from '../questoes-avaliacoes';
import { ItemSistemaArquivos } from '../item-sistema-arquivos';

export class Avaliacao extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.AVALIACAO;

  descricao: string;
  isModelo: boolean;
  questoesAvaliacoes: QuestoesAvaliacoes[];
  aplicacoes: Aplicacao[];
  configuracaoAvaliacao: ConfiguracaoAvaliacao;
}
