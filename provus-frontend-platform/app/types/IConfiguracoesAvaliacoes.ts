export interface IConfiguracoes {
  id?: number;
  avaliacaoId?: number;
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
}