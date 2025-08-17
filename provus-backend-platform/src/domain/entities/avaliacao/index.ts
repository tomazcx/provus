import { TipoItemEnum } from 'src/domain/enums/tipo-item.enum';
import type { Aplicacao } from '../aplicacao';
import type { Avaliador } from '../avaliador';
import type { ConfiguracaoAvaliacao } from '../configuracao-avaliacao';
import { QuestoesAvaliacoes } from '../questoes-avaliacoes';

export class Avaliacao {
  readonly tipo = TipoItemEnum.AVALIACAO;

  avaliador: Avaliador;
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  questoesAvaliacoes: QuestoesAvaliacoes[];
  aplicacoes: Aplicacao[];
  configuracaoAvaliacao: ConfiguracaoAvaliacao;
}
