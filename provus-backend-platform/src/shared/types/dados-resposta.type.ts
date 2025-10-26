export type DadosRespostaDiscursiva = {
  texto: string;
};

export type DadosRespostaObjetiva = {
  alternativa_id: number | null;
};

export type DadosRespostaMultipla = {
  alternativas_id: number[];
};

export type DadosRespostaType =
  | DadosRespostaDiscursiva
  | DadosRespostaObjetiva
  | DadosRespostaMultipla;
