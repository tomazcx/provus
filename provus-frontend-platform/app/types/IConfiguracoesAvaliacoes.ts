export interface IRandomizationRule {
  id?: number;
  quantidade: number;
  dificuldade: "Qualquer" | "Fácil" | "Médio" | "Difícil";
  grupo: {
    pastas: number[];
    questoes: number[];
  };
}

export interface IConfiguracoes {
  id?: number;
  avaliacaoId?: number;
  hasPontuacaoFixa?: boolean;
  pontuacaoTotalFixa?: number;
  dataDeAplicacao?: string;
  dataDeEncerramento?: string;
  mostrarPontuacao?: boolean;
  mostrarRespostas?: boolean;
  permitirMultiplosEnvios?: boolean;
  autocorrecaoIa?: boolean;
  numeroMaximoDeEnvios?: number;
  embaralharQuestoes?: boolean;
  embaralharAlternativas?: boolean;
  tempoMaximo?: number;
  tempoMinimo?: number;
  criadoEm?: string;
  atualizadoEm?: string;

  randomizacaoSimples: boolean;
  randomizacaoBancoSimples: boolean;
  poolSelecaoBanco: {
    pastas: [];
    questoes: [];
  };
  randomizacaoBancoConfiguravel: boolean;
  regrasRandomizacaoConfiguravel: IRandomizationRule[];
  aplicacaoManual: boolean;
  aplicacaoAgendada: boolean;
  dataAgendada: Date | null;

  exibirPontuacaDaSubmissao: boolean;
  permitirRevisao: boolean;
  exibirPontuacaoQuestoes: boolean;
}
