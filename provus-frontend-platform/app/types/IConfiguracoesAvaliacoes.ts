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

  randomizacaoSimples: false;
  randomizacaoBancoSimples: false;
    poolSelecaoBanco: {
    pastas: [];
    questoes: [];
  };
  randomizacaoBancoConfiguravel: false;
  regrasRandomizacaoConfiguravel: IRandomizationRule[];
}
