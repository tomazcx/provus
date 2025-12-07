import { DificuldadeQuestaoEnum } from "../../enums/DificuldadeQuestaoEnum";
import { DificuldadeRandomizacaoEnum } from "../../enums/DificuldadeRandomizacaoEnum";
import { QuestaoEntity } from "../../enums/Questao.entity";
import { TipoAplicacaoEnum } from "../../enums/TipoAplicacaoEnum";
import { TipoInfracaoEnum } from "../../enums/TipoInfracaoEnum";
import { TipoPenalidadeEnum } from "../../enums/TipoPenalidadeEnum";
import { TipoQuestaoEnum } from "../../enums/TipoQuestaoEnum";
import { TipoRandomizacaoEnum } from "../../enums/TipoRandomizacaoEnum";

export interface PunicaoPorOcorrenciaEntity {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade?: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
  sempre: boolean;
  quantidadeAplicacoes: number | null;
}

export interface RegraGeracaoIaEntity {
  id: number;
  quantidade: number;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
  materiaisAnexadosIds: number[];
  assunto?: string;
}

export interface RandomizationRuleEntity {
  id: number;
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: QuestaoEntity[];
}

export interface ConfiguracoesGeraisEntity {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date | null;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  exibirPontuacaoQuestoes: boolean;
  configuracoesRandomizacao: RandomizationRuleEntity[];
}

export interface ConfiguracoesSegurancaEntity {
  proibirTrocarAbas: boolean;
  proibirCopiarColar: boolean;
  quantidadeTentativas: number;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: PunicaoPorOcorrenciaEntity[];
}

export interface ConfiguracoesEntity {
  configuracoesGerais: ConfiguracoesGeraisEntity;
  configuracoesSeguranca: ConfiguracoesSegurancaEntity;
}
