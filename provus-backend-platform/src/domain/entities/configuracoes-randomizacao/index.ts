import DificuldadeRandomizacaoEnum from 'src/domain/enums/dificuldade-randomizacao.enum';
import TipoRandomizacaoEnum from 'src/domain/enums/tipo-randomizacao.enum';
import type { Questao } from '../questao';
import { ConfiguracoesGerais } from '../configuracoes-gerais';

export class ConfiguracoesRandomizacao {
  id: number;
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  poolDeQuestoes: Questao[];
  configuracoesGerais: ConfiguracoesGerais;
}
