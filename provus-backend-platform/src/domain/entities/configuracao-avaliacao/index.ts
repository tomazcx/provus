import { ConfiguracoesGerais } from '../configuracoes-gerais';
import { ConfiguracoesSeguranca } from '../configuracoes-seguranca';

export class ConfiguracaoAvaliacao {
  id: number;
  configuracoesSeguranca: ConfiguracoesSeguranca;
  configuracoesGerais: ConfiguracoesGerais;
}
