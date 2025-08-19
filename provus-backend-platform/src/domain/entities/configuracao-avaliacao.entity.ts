import { ConfiguracoesGerais } from './configuracoes-gerais.entity';
import { ConfiguracoesSeguranca } from './configuracoes-seguranca.entity';

export class ConfiguracaoAvaliacao {
  id: number;
  configuracoesSeguranca: ConfiguracoesSeguranca;
  configuracoesGerais: ConfiguracoesGerais;
}
