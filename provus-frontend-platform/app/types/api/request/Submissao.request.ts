export interface SubmitRespostaRequestPayload {
  questaoId: number;
  texto?: string;
  alternativa_id?: number | null;
  alternativas_id?: number[];
}

export interface SubmitAvaliacaoRequestPayload {
  respostas: SubmitRespostaRequestPayload[];
}
