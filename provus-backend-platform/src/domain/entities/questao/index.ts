import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';
import type { Alternativa } from '../alternativa';
import { SubmissaoResposta } from '../submissao-resposta';
import { QuestoesAvaliacoes } from '../questoes-avaliacoes';
import { TipoItemEnum } from 'src/domain/enums/tipo-item.enum';
import { ConfiguracoesRandomizacao } from '../configuracoes-randomizacao';
import { ItemSistemaArquivos } from '../item-sistema-arquivos';

export class Questao extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.QUESTAO;

  id: number;
  titulo: string;
  dificuldade: DificuldadeQuestaoEnum;
  descricao: string;
  exemploDeResposta: string;
  pontuacao: number;
  isModelo: boolean;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao: string;
  alternativas: Alternativa[];
  questoes_avaliacoes: QuestoesAvaliacoes;
  criadoEm: Date;
  atualizadoEm: Date;
  submissoesDasRespostas: SubmissaoResposta[];
  configuracoesRandomizacao: ConfiguracoesRandomizacao[];
}
