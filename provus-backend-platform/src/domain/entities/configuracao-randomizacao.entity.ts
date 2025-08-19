import DificuldadeRandomizacaoEnum from 'src/domain/enums/dificuldade-randomizacao.enum';
import TipoRandomizacaoEnum from 'src/domain/enums/tipo-randomizacao.enum';
import type { Questao } from './questao.entity';
import { ConfiguracoesGerais } from './configuracoes-gerais.entity';

export class ConfiguracoesRandomizacao {
  id: number;
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  poolDeQuestoes: Questao[];
  configuracoesGerais: ConfiguracoesGerais;
}
