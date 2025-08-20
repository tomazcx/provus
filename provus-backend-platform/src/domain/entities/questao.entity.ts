import DificuldadeQuestaoEnum from '../enums/dificuldade-questao.enum';
import TipoItemEnum from '../enums/tipo-item.enum';
import TipoQuestaoEnum from '../enums/tipo-questao.enum';
import { Alternativa } from './alternativa.entity';
import { ConfiguracoesRandomizacao } from './configuracao-randomizacao.entity';
import { ItemSistemaArquivos } from './item-sistema-arquivos.entity';
import { QuestoesAvaliacoes } from './questoes-avaliacoes.entity';
import { SubmissaoResposta } from './submissao-resposta.entity';

export class Questao extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.QUESTAO;

  dificuldade: DificuldadeQuestaoEnum;
  descricao: string;
  exemploRespostaIa: string;
  pontuacao: number;
  isModelo: boolean;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao: string;
  alternativas: Alternativa[];
  questoes_avaliacoes: QuestoesAvaliacoes;
  submissoesDasRespostas: SubmissaoResposta[];
  configuracoesRandomizacao: ConfiguracoesRandomizacao[];
}
